/**
 * TEXTY v2 - Text Processing Engine
 * Core text manipulation and analysis utilities. No DOM interaction here.
 */

// === TEXT STATISTICS ===
class TextAnalyzer {
    // Cache for syllable counts to improve performance
    static syllableCache = new Map();

    static analyze(text) {
        if (!text || !text.trim()) {
            return this.getEmptyStats();
        }

        // Single pass to extract basic stats
        const words = this.getWords(text);
        const sentences = this.getSentences(text);
        const paragraphs = this.getParagraphs(text);
        const characters = text.length;
        const wordCount = words.length;

        // Only calculate complex metrics if text is substantial
        let fleschScore = 0;
        let gradeLevel = '—';

        if (wordCount > 10 && sentences.length > 0) {
            const avgWordsPerSentence = wordCount / sentences.length;
            const avgSyllablesPerWord = this.calculateAvgSyllables(words);
            fleschScore = this.calculateFleschScore(avgWordsPerSentence, avgSyllablesPerWord);
            gradeLevel = this.getGradeLevel(fleschScore);
        }

        // Improved reading time calculation
        const readingTime = this.calculateReadingTime(wordCount);

        // Calculate additional metrics
        const uniqueWords = new Set(words.map(w => w.toLowerCase())).size;
        const avgWordLength = wordCount > 0
            ? (words.reduce((sum, w) => sum + w.length, 0) / wordCount).toFixed(1)
            : '—';

        return {
            words: wordCount,
            uniqueWords,
            characters,
            sentences: sentences.length,
            paragraphs: paragraphs.length,
            avgWordLength,
            readingTime,
            fleschScore: Math.round(fleschScore),
            gradeLevel,
            keywords: wordCount > 20 ? this.extractKeywords(words) : []
        };
    }

    static calculateReadingTime(wordCount) {
        if (wordCount === 0) return '0';
        if (wordCount < 100) return '<1'; // Show "<1m" for very short text
        return Math.ceil(wordCount / 200);
    }

    static getEmptyStats() {
        return {
            words: 0,
            uniqueWords: 0,
            characters: 0,
            sentences: 0,
            paragraphs: 0,
            avgWordLength: '—',
            readingTime: 0,
            fleschScore: 0,
            gradeLevel: '—',
            keywords: []
        };
    }

    static getWords(text) {
        // Trim first, then split - no empty strings will be created
        const trimmed = text.trim();
        return trimmed ? trimmed.split(/\s+/) : [];
    }

    static getSentences(text) {
        // Split on sentence endings, handling multiple punctuation and whitespace
        return text.split(/[.!?]+\s+|[.!?]+$/).filter(s => s.trim().length > 0);
    }

    static getParagraphs(text) {
        return text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    }

    static countSyllables(word) {
        if (!word || word.length === 0) return 0;

        word = word.toLowerCase().trim();

        // Check cache first
        if (this.syllableCache.has(word)) {
            return this.syllableCache.get(word);
        }

        let count;

        // Handle numbers - count each digit as a syllable
        if (/^\d+$/.test(word)) {
            count = word.length;
        } else if (word.length <= 3) {
            // Handle very short words
            count = 1;
        } else {
            // Remove common silent endings
            const cleaned = word
                .replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '')
                .replace(/^y/, '');

            // Count vowel groups
            const matches = cleaned.match(/[aeiouy]{1,2}/g);
            count = Math.max(1, matches ? matches.length : 1);
        }

        // Cache the result (limit cache size to prevent memory bloat)
        if (this.syllableCache.size > 1000) {
            // Clear oldest entries when cache gets too large
            const firstKey = this.syllableCache.keys().next().value;
            this.syllableCache.delete(firstKey);
        }
        this.syllableCache.set(word, count);

        return count;
    }
    
    static calculateAvgSyllables(words) {
        if (words.length === 0) return 0;
        return words.reduce((total, word) => total + this.countSyllables(word), 0) / words.length;
    }

    static calculateFleschScore(avgWords, avgSyllables) {
        // Prevent division by zero and invalid inputs
        if (avgWords === 0 || avgSyllables === 0 || isNaN(avgWords) || isNaN(avgSyllables)) {
            return 0;
        }

        const score = 206.835 - (1.015 * avgWords) - (84.6 * avgSyllables);

        // Clamp score between 0 and 100 for valid range
        return Math.max(0, Math.min(100, score));
    }

    static getGradeLevel(score) {
        // Handle edge cases
        if (score <= 0 || isNaN(score)) return '—';
        if (score >= 100) return 'Pre-school';
        if (score >= 90) return '5th Grade';
        if (score >= 80) return '6th Grade';
        if (score >= 70) return '7th Grade';
        if (score >= 60) return '8th-9th Grade';
        if (score >= 50) return '10th-12th Grade';
        if (score >= 30) return 'College';
        return 'Graduate';
    }

    static extractKeywords(words, count = 7, minFrequency = 2) {
        // Expanded and more comprehensive stopwords list
        const stopWords = new Set([
            'the', 'and', 'to', 'of', 'a', 'in', 'for', 'is', 'on', 'that', 'by', 'this', 'with',
            'i', 'you', 'it', 'not', 'or', 'be', 'are', 'from', 'at', 'as', 'your', 'all', 'any',
            'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his',
            'how', 'man', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did', 'its',
            'let', 'put', 'say', 'she', 'too', 'use', 'have', 'been', 'other', 'were', 'which',
            'their', 'what', 'there', 'when', 'will', 'would', 'about', 'into', 'than', 'them',
            'these', 'some', 'could', 'only', 'may', 'then', 'such', 'an', 'but', 'we', 'he',
            'me', 'my', 'so', 'up', 'if', 'no', 'do', 'just', 'they', 'very', 'more', 'even',
            'also', 'well', 'back', 'after', 'should', 'each', 'where', 'those', 'much', 'own',
            'most', 'through', 'being', 'over', 'here', 'both', 'while', 'under', 'same', 'us'
        ]);

        const wordCount = {};
        words.forEach(word => {
            const cleanWord = word.toLowerCase()
                .replace(/[^\w]/g, '') // Remove punctuation
                .replace(/^\d+$/, ''); // Remove pure numbers

            // Only count words that are:
            // - Longer than 2 characters
            // - Not in stopwords list
            // - Not empty after cleaning
            if (cleanWord.length > 2 && !stopWords.has(cleanWord) && cleanWord) {
                wordCount[cleanWord] = (wordCount[cleanWord] || 0) + 1;
            }
        });

        return Object.entries(wordCount)
            .filter(([_, freq]) => freq >= minFrequency) // Filter by minimum frequency
            .sort((a, b) => b[1] - a[1]) // Sort by frequency (highest first)
            .slice(0, count) // Take top N keywords
            .map(([word]) => word); // Return just the words
    }
}

// === TEXT FORMATTING ===
class TextFormatter {
    static stripFormatting(text) {
        if (!text) return '';

        // Handle plain text input (no HTML)
        if (!text.includes('<')) {
            return text.replace(/[ \t]+/g, ' ')  // Clean up multiple spaces
                      .replace(/[ \t]*\n[ \t]*/g, '\n')  // Clean spaces around newlines
                      .trim();
        }

        // === HTML PROCESSING ===
        
        // Step 1: Normalize common HTML patterns before parsing
        text = text
            // Convert <br> tags to newlines
            .replace(/<br\s*\/?>/gi, '\n')
            // Convert </p><p> to paragraph breaks
            .replace(/<\/p>\s*<p[^>]*>/gi, '\n\n')
            // Convert list items to newlines
            .replace(/<li[^>]*>/gi, '\n• ')
            .replace(/<\/li>/gi, '')
            // Convert div endings to newlines
            .replace(/<\/div>/gi, '\n')
            // Convert heading endings to newlines
            .replace(/<\/h[1-6]>/gi, '\n');

        // Step 2: Create DOM element to properly parse remaining HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = text;

        // Step 3: Extract text content
        let cleanText = tempDiv.textContent || tempDiv.innerText || '';

        // Step 4: Final cleanup - preserve line structure while cleaning whitespace
        cleanText = cleanText
            // Clean up spaces but preserve line breaks
            .replace(/[ \t]+/g, ' ')           // Multiple spaces/tabs → single space
            .replace(/[ \t]*\n[ \t]*/g, '\n')  // Remove spaces around newlines
            .replace(/\n{4,}/g, '\n\n\n')      // Limit to max 3 consecutive newlines
            .trim();                           // Remove leading/trailing whitespace

        return cleanText;
    }

    static autoFormat(text) {
        if (!text || !text.trim()) return '';
        
        // Split by double+ newlines to identify paragraphs
        const paragraphs = text.split(/\n\s*\n/);
        
        const formatLine = (line) => {
            return line
                .replace(/[ \t]+/g, ' ')                              // Multiple spaces → single space
                .trim()                                                // Remove leading/trailing spaces
                .replace(/\s+([,.!?;:])/g, '$1')                      // Remove space before punctuation
                .replace(/([.!?])\s*([A-Z])/g, '$1 $2')               // Ensure space after sentence ending
                .replace(/(^|[.!?]\s+)([a-z])/g, (_, p1, p2) => p1 + p2.toUpperCase()) // Capitalize sentences
                .replace(/\bi\b/g, 'I')                               // Fix lowercase "i"
                .replace(/\s+'/g, "'")                                // Fix apostrophes
                .replace(/'\s+/g, "'");
        };
        
        return paragraphs
            .map(paragraph => {
                // Handle single lines within paragraphs
                const lines = paragraph.split('\n');
                return lines
                    .map(line => line.trim() ? formatLine(line) : '') // Format non-empty lines
                    .filter(line => line !== '')                      // Remove empty lines
                    .join('\n');                                       // Rejoin with newlines
            })
            .filter(Boolean)     // Remove empty paragraphs
            .join('\n\n');       // Rejoin paragraphs with double newlines
    }
}

// === CASE CONVERSION ===
class CaseConverter {
    static convert(text, caseType) {
        if (!text) return '';
        
        switch(caseType) {
            case 'upper': 
                return text.toUpperCase();
            case 'lower': 
                return text.toLowerCase();
            case 'title': 
                return text.replace(/\w\S*/g, txt => 
                    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
                );
            case 'sentence': 
                return text.toLowerCase().replace(/(^|[.!?]\s+)([a-z])/g, (_, p1, p2) => 
                    p1 + p2.toUpperCase()
                );
            default: 
                return text;
        }
    }
}

// === LOREM IPSUM GENERATOR ===
class LoremGenerator {
    static libraries = {
        latin: [
            'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit', 
            'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
            'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud'
        ],
        english: [
            'the', 'quick', 'brown', 'fox', 'jumps', 'over', 'lazy', 'dog', 'beautiful',
            'landscape', 'mountain', 'river', 'forest', 'sunshine', 'peaceful', 'journey',
            'adventure', 'discover', 'explore', 'amazing', 'wonderful', 'incredible'
        ],
        tech: [
            'algorithm', 'database', 'framework', 'application', 'interface', 'protocol', 
            'cloud', 'microservices', 'container', 'kubernetes', 'docker', 'api',
            'scalability', 'performance', 'infrastructure', 'deployment', 'optimization'
        ],
        business: [
            'strategy', 'growth', 'innovation', 'market', 'customer', 'revenue', 'profit', 
            'investment', 'portfolio', 'stakeholder', 'partnership', 'collaboration',
            'efficiency', 'productivity', 'transformation', 'competitive', 'advantage'
        ]
    };

    static generate(type, count, style) {
        const library = this.libraries[style] || this.libraries.english;
        
        if (type === 'words') return this.generateWords(count, library);
        if (type === 'sentences') return this.generateSentences(count, library);
        return this.generateParagraphs(count, library);
    }

    static generateWords(count, lib) {
        const words = [];
        for (let i = 0; i < count; i++) {
            words.push(lib[Math.floor(Math.random() * lib.length)]);
        }
        return words.join(' ') + '.';
    }

    static generateSentences(count, lib) {
        const sentences = [];
        for (let i = 0; i < count; i++) {
            const wordCount = Math.floor(Math.random() * 12) + 5;
            const words = [];
            for (let j = 0; j < wordCount; j++) {
                words.push(lib[Math.floor(Math.random() * lib.length)]);
            }
            words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
            sentences.push(words.join(' ') + '.');
        }
        return sentences.join(' ');
    }

    static generateParagraphs(count, lib) {
        const paragraphs = [];
        for (let i = 0; i < count; i++) {
            const sentenceCount = Math.floor(Math.random() * 5) + 3;
            paragraphs.push(this.generateSentences(sentenceCount, lib));
        }
        return paragraphs.join('\n\n');
    }
}

// === FORMATTING EXTRACTION ===
class FormattingExtractor {
    /**
     * Extracts formatting metadata from HTML content
     * @param {string} html - The HTML content to analyze
     * @returns {Object} Formatting metadata including fonts, sizes, colors, etc.
     */
    static extractFormatting(html) {
        if (!html || !html.includes('<')) {
            return null; // No HTML content
        }

        try {
            // Create isolated element for safe parsing (not attached to DOM)
            const tempDiv = document.createElement('div');

            // Sanitize: remove script tags before parsing
            const sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
            tempDiv.innerHTML = sanitized;

            const formatting = {
                fonts: new Set(),
                sizes: new Set(),
                weights: new Set(),
                colors: new Set(),
                styles: new Set(),
                elements: new Set()
            };

            // Walk through all elements and extract inline styles
            const elements = tempDiv.querySelectorAll('*');
            elements.forEach(el => {
                // Track element types
                formatting.elements.add(el.tagName.toLowerCase());

                // Extract inline styles
                if (el.style.fontFamily) {
                    formatting.fonts.add(el.style.fontFamily.replace(/['"]/g, ''));
                }
                if (el.style.fontSize) {
                    formatting.sizes.add(el.style.fontSize);
                }
                if (el.style.fontWeight) {
                    formatting.weights.add(el.style.fontWeight);
                }
                if (el.style.color) {
                    formatting.colors.add(el.style.color);
                }

                // Detect formatting from tags
                const tag = el.tagName.toLowerCase();
                if (['b', 'strong'].includes(tag)) formatting.styles.add('Bold');
                if (['i', 'em'].includes(tag)) formatting.styles.add('Italic');
                if (tag === 'u') formatting.styles.add('Underline');
                if (tag === 'strike' || tag === 's') formatting.styles.add('Strikethrough');
                if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tag)) {
                    formatting.styles.add('Heading');
                }

                // Extract font attributes
                if (el.hasAttribute('face')) {
                    formatting.fonts.add(el.getAttribute('face'));
                }
                if (el.hasAttribute('size')) {
                    formatting.sizes.add(el.getAttribute('size'));
                }
                if (el.hasAttribute('color')) {
                    formatting.colors.add(el.getAttribute('color'));
                }
            });

            // Convert sets to sorted arrays and clean up
            return {
                fonts: Array.from(formatting.fonts).filter(f => f).slice(0, 5),
                sizes: Array.from(formatting.sizes).filter(s => s).slice(0, 5),
                weights: Array.from(formatting.weights).filter(w => w && w !== '400').slice(0, 5),
                colors: Array.from(formatting.colors).filter(c => c).slice(0, 8),
                styles: Array.from(formatting.styles).filter(s => s),
                elements: Array.from(formatting.elements).filter(e => !['div', 'span', 'font'].includes(e)).slice(0, 8),
                hasFormatting: formatting.fonts.size > 0 || formatting.sizes.size > 0 ||
                               formatting.styles.size > 0 || formatting.colors.size > 0
            };
        } catch (error) {
            console.error('Error extracting formatting:', error);
            return null;
        }
    }

    /**
     * Formats the extracted metadata for display
     * @param {Object} formatting - The formatting metadata object
     * @returns {Object} Formatted display data
     */
    static formatForDisplay(formatting) {
        if (!formatting || !formatting.hasFormatting) {
            return null;
        }

        const display = [];

        if (formatting.fonts.length > 0) {
            display.push({
                label: 'Fonts',
                values: formatting.fonts
            });
        }

        if (formatting.sizes.length > 0) {
            display.push({
                label: 'Sizes',
                values: formatting.sizes
            });
        }

        if (formatting.weights.length > 0) {
            display.push({
                label: 'Weights',
                values: formatting.weights
            });
        }

        if (formatting.colors.length > 0) {
            display.push({
                label: 'Colors',
                values: formatting.colors
            });
        }

        if (formatting.styles.length > 0) {
            display.push({
                label: 'Styles',
                values: formatting.styles
            });
        }

        if (formatting.elements.length > 0) {
            display.push({
                label: 'Elements',
                values: formatting.elements
            });
        }

        return display;
    }
}

// === UTILITIES ===
class TextUtils {
    static copyToClipboard(text) {
        return navigator.clipboard.writeText(text).catch(() => {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            try {
                document.execCommand('copy');
                return Promise.resolve();
            } catch (err) {
                return Promise.reject(err);
            } finally {
                document.body.removeChild(textArea);
            }
        });
    }

    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    static formatNumber(num) {
        return num.toLocaleString();
    }
}
