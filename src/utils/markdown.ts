import MarkdownIt from 'markdown-it'
import markdownItKatexExternal from 'markdown-it-katex-external'
import markdownItEmoji from 'markdown-it-emoji'

export default function markdownToHtml(content: any) {
  const md = new MarkdownIt({
    html: true
  })
    .use(markdownItKatexExternal)
    .use(markdownItEmoji)
  return md.render(content)
}
