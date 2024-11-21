import * as d3 from 'd3';

class TreeNode {
  constructor(key, color = 'red') {
    this.key = key;
    this.color = color;  // 红色或黑色
    this.left = null;     // 左子树
    this.right = null;    // 右子树
    this.parent = null;   // 父节点
  }
}

class RedBlackTree {
  constructor() {
    this.nil = new TreeNode(null, 'black');
    this.root = this.nil;
    this.logs = []; // 存储操作日志
  }

  insert(key) {
    this.logs.push(`插入节点: ${key} (红色)`); // 记录插入操作
    let newNode = new TreeNode(key, 'red');
    let parent = this.nil;
    let current = this.root;

    while (current !== this.nil) {
      parent = current;
      if (key < current.key) {
        current = current.left;
      } else {
        current = current.right;
      }
    }

    newNode.parent = parent;

    if (parent === this.nil) {
      this.root = newNode;
    } else if (key < parent.key) {
      parent.left = newNode;
    } else {
      parent.right = newNode;
    }

    newNode.left = this.nil;
    newNode.right = this.nil;

    this.fixInsert(newNode);
  }

  fixInsert(node) {
    while (node.parent.color === 'red') {
      if (node.parent === node.parent.parent.left) {
        let uncle = node.parent.parent.right;
        if (uncle.color === 'red') {
          node.parent.color = 'black';
          uncle.color = 'black';
          node.parent.parent.color = 'red';
          node = node.parent.parent;
        } else {
          if (node === node.parent.right) {
            node = node.parent;
            this.leftRotate(node);
          }
          node.parent.color = 'black';
          node.parent.parent.color = 'red';
          this.rightRotate(node.parent.parent);
        }
      } else {
        let uncle = node.parent.parent.left;
        if (uncle.color === 'red') {
          node.parent.color = 'black';
          uncle.color = 'black';
          node.parent.parent.color = 'red';
          node = node.parent.parent;
        } else {
          if (node === node.parent.left) {
            node = node.parent;
            this.rightRotate(node);
          }
          node.parent.color = 'black';
          node.parent.parent.color = 'red';
          this.leftRotate(node.parent.parent);
        }
      }
    }
    this.root.color = 'black';
  }

  leftRotate(x) {
    this.logs.push(`左旋: ${x.key}`);
    let y = x.right;
    x.right = y.left;
    if (y.left !== this.nil) {
      y.left.parent = x;
    }
    y.parent = x.parent;
    if (x.parent === this.nil) {
      this.root = y;
    } else if (x === x.parent.left) {
      x.parent.left = y;
    } else {
      x.parent.right = y;
    }
    y.left = x;
    x.parent = y;
  }

  rightRotate(x) {
    this.logs.push(`右旋: ${x.key}`);
    let y = x.left;
    x.left = y.right;
    if (y.right !== this.nil) {
      y.right.parent = x;
    }
    y.parent = x.parent;
    if (x.parent === this.nil) {
      this.root = y;
    } else if (x === x.parent.right) {
      x.parent.right = y;
    } else {
      x.parent.left = y;
    }
    y.right = x;
    x.parent = y;
  }

  draw(container) {
    const nodes = [];
    const links = [];
    
    // 遍历树并计算节点的水平位置（position）和深度（depth）
    const traverse = (node, depth = 0, position = 0, offset = 100) => {
      if (node === this.nil) return;
      
      nodes.push({ id: node.key, color: node.color, depth, position });
      
      // 左子树
      if (node.left !== this.nil) {
        links.push({ source: node.key, target: node.left.key });
        traverse(node.left, depth + 1, position - offset, offset / 1.5);
      }
      
      // 右子树
      if (node.right !== this.nil) {
        links.push({ source: node.key, target: node.right.key });
        traverse(node.right, depth + 1, position + offset, offset / 1.5);
      }
    };
    
    traverse(this.root);

    const width = 1000;
    const height = 600;

    const svg = d3.select(container)
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    // 绘制连线
    const link = svg.selectAll('.link')
      .data(links)
      .enter().append('line')
      .attr('class', 'link')
      .attr('x1', d => nodes.find(n => n.id === d.source).position + width / 2)
      .attr('y1', d => nodes.find(n => n.id === d.source).depth * 100 + 50)
      .attr('x2', d => nodes.find(n => n.id === d.target).position + width / 2)
      .attr('y2', d => nodes.find(n => n.id === d.target).depth * 100 + 50)
      .style('stroke', '#aaa');

    // 绘制节点
    const node = svg.selectAll('.node')
      .data(nodes)
      .enter().append('circle')
      .attr('class', 'node')
      .attr('cx', d => d.position + width / 2)
      .attr('cy', d => d.depth * 100 + 50)
      .attr('r', 20)
      .style('fill', d => d.color === 'red' ? 'red' : 'black');
    
    node.append('title').text(d => `Key: ${d.id}`);

    // 添加数字到节点上
    svg.selectAll('.node-text')
      .data(nodes)
      .enter().append('text')
      .attr('class', 'node-text')
      .attr('x', d => d.position + width / 2)
      .attr('y', d => d.depth * 100 + 50)
      .attr('dy', 4)  // 微调垂直位置
      .attr('text-anchor', 'middle')
      .style('fill', 'white')
      .style('font-size', '14px')
      .text(d => d.id); // 显示节点值
  }
}

export { RedBlackTree };
