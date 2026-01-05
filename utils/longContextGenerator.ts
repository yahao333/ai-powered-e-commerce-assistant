/**
 * 长上下文测试数据生成器
 * 用于生成超过普通模型限制（如 DeepSeek 128k）的超长文本，
 * 以测试 Gemini (1M+ context) 的“大海捞针”检索能力。
 */

export const generateMassivePrompt = (): { fullPrompt: string, secretKey: string, estimatedTokens: string } => {
    // 基础填充文本
    const baseSentence = "在人工智能的浩瀚星海中，上下文窗口的大小决定了模型能理解的信息广度。有些大上下文模型可以支持百万级 tokens 的输入，这使得处理整本书籍、大型代码库或长文档成为可能；而一些常见模型的上下文窗口通常更小。";
    
    // 目标字符数：600,000 字符。
    // 中文 token 估算通常为 0.7~1 chars/token。600k chars 约为 400k-600k tokens，远超 128k。
    const targetCharCount = 600000;
    const repeatCount = Math.ceil(targetCharCount / baseSentence.length);
    
    // 使用 Array.join 高效构建大字符串
    const filler = Array(repeatCount).fill(baseSentence).join("\n");
    
    // 生成随机密钥
    const secretKey = `AI-TEST-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 10000)}`;
    
    // 构建完整的 Prompt：大海捞针测试
    // 密钥被放置在海量文本的末尾
    const fullPrompt = `我需要你进行一项“大海捞针”的长上下文检索测试。

下面是一段极长的文本（超过 150k tokens），请仔细阅读全文，并在其中找到隐藏的“秘密密钥”。

[长文本开始]
${filler}
[长文本中间插入干扰项：今天的密钥不是 KEY-12345]
${filler.substring(0, 10000)}
注意：真正的秘密密钥是：${secretKey}
[长文本结束]

任务：
1. 忽略上面所有重复的填充内容。
2. 准确提取出文本当中提到的“秘密密钥”。
3. 告诉我你刚刚阅读了大约多少字符的文本。`;

    return { 
        fullPrompt, 
        secretKey,
        estimatedTokens: "≈ 150k - 200k tokens"
    };
};
