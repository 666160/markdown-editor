// 智能粘贴：将网页/富文本内容转换为 Markdown

// HTML 转 Markdown
export function htmlToMarkdown(html: string): string {
    // 创建临时 DOM 元素
    const temp = document.createElement('div');
    temp.innerHTML = html;

    return convertNodeToMarkdown(temp);
}

// 递归转换 DOM 节点
function convertNodeToMarkdown(node: Node): string {
    let result = '';

    node.childNodes.forEach(child => {
        if (child.nodeType === Node.TEXT_NODE) {
            result += child.textContent || '';
            return;
        }

        if (child.nodeType !== Node.ELEMENT_NODE) return;

        const element = child as HTMLElement;
        const tagName = element.tagName.toLowerCase();
        const content = convertNodeToMarkdown(element);

        switch (tagName) {
            // 标题
            case 'h1':
                result += `\n# ${content.trim()}\n\n`;
                break;
            case 'h2':
                result += `\n## ${content.trim()}\n\n`;
                break;
            case 'h3':
                result += `\n### ${content.trim()}\n\n`;
                break;
            case 'h4':
                result += `\n#### ${content.trim()}\n\n`;
                break;
            case 'h5':
                result += `\n##### ${content.trim()}\n\n`;
                break;
            case 'h6':
                result += `\n###### ${content.trim()}\n\n`;
                break;

            // 格式化
            case 'strong':
            case 'b':
                result += `**${content}**`;
                break;
            case 'em':
            case 'i':
                result += `*${content}*`;
                break;
            case 'code':
                result += `\`${content}\``;
                break;
            case 'del':
            case 's':
                result += `~~${content}~~`;
                break;

            // 链接和图片
            case 'a':
                const href = element.getAttribute('href') || '';
                result += `[${content}](${href})`;
                break;
            case 'img':
                const src = element.getAttribute('src') || '';
                const alt = element.getAttribute('alt') || '图片';
                result += `![${alt}](${src})`;
                break;

            // 列表
            case 'ul':
                result += '\n' + content + '\n';
                break;
            case 'ol':
                result += '\n' + content + '\n';
                break;
            case 'li':
                const parent = element.parentElement;
                if (parent?.tagName.toLowerCase() === 'ol') {
                    const index = Array.from(parent.children).indexOf(element) + 1;
                    result += `${index}. ${content.trim()}\n`;
                } else {
                    result += `- ${content.trim()}\n`;
                }
                break;

            // 块级元素
            case 'p':
                result += `\n${content.trim()}\n\n`;
                break;
            case 'blockquote':
                result += '\n> ' + content.trim().replace(/\n/g, '\n> ') + '\n\n';
                break;
            case 'pre':
                const codeEl = element.querySelector('code');
                const lang = codeEl?.className.match(/language-(\w+)/)?.[1] || '';
                result += `\n\`\`\`${lang}\n${content.trim()}\n\`\`\`\n\n`;
                break;
            case 'hr':
                result += '\n---\n\n';
                break;
            case 'br':
                result += '\n';
                break;

            // 表格
            case 'table':
                result += '\n' + convertTableToMarkdown(element) + '\n';
                break;

            // 其他容器
            case 'div':
            case 'section':
            case 'article':
            case 'main':
            case 'span':
                result += content;
                break;

            default:
                result += content;
        }
    });

    return result;
}

// 表格转 Markdown
function convertTableToMarkdown(table: HTMLElement): string {
    const rows = table.querySelectorAll('tr');
    if (rows.length === 0) return '';

    const lines: string[] = [];
    let isHeader = true;

    rows.forEach((row, index) => {
        const cells = row.querySelectorAll('td, th');
        const cellTexts = Array.from(cells).map(cell => (cell.textContent || '').trim());
        lines.push('| ' + cellTexts.join(' | ') + ' |');

        // 添加分隔行
        if (isHeader && index === 0) {
            lines.push('| ' + cellTexts.map(() => '---').join(' | ') + ' |');
            isHeader = false;
        }
    });

    return lines.join('\n');
}

// 处理粘贴事件
export function handleSmartPaste(
    event: ClipboardEvent,
    onInsert: (text: string) => void
): boolean {
    const clipboardData = event.clipboardData;
    if (!clipboardData) return false;

    // 优先处理 HTML
    const html = clipboardData.getData('text/html');
    if (html && html.trim()) {
        const markdown = htmlToMarkdown(html);
        if (markdown.trim()) {
            onInsert(markdown.trim());
            return true;
        }
    }

    // 处理纯文本
    const text = clipboardData.getData('text/plain');

    // 检测 URL 列表，转为 Markdown 链接
    const urlRegex = /^https?:\/\//;
    if (urlRegex.test(text.trim())) {
        const lines = text.split('\n').map(line => {
            line = line.trim();
            if (urlRegex.test(line)) {
                // 尝试从 URL 提取标题
                try {
                    const url = new URL(line);
                    const title = url.hostname.replace('www.', '');
                    return `[${title}](${line})`;
                } catch {
                    return `[链接](${line})`;
                }
            }
            return line;
        });
        onInsert(lines.join('\n'));
        return true;
    }

    return false;
}
