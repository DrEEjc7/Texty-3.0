/**
 * TEXTY v2 - Main Application Controller
 * Handles DOM, events, and app initialization.
 */
class TextyApp {
    constructor() {
        this.elements = {};
        this.state = {
            theme: localStorage.getItem('texty-theme') || 'light',
            lastAnalyzedText: '',
            lastAnalysisResult: null
        };
        this.MAX_TEXT_LENGTH = 100000; // 100k characters max
        this.AUTOSAVE_INTERVAL = 30000; // 30 seconds
        this.autoSaveTimer = null;
        this.analysisTimer = null; // Single timer for adaptive debouncing
        this.rafId = null; // RequestAnimationFrame ID to prevent duplicate updates
        this.toastTimer = null; // Toast display timer

        this.init();
    }

    init() {
        try {
            this.cacheElements();
            this.bindEvents();
            this.setTheme(this.state.theme); // Set initial theme
            this.setCurrentYear();
            this.generateInitialLorem();
            this.restoreAutoSave(); // Restore saved text if available
            // Only analyze if text was restored
            if (this.elements.textInput?.value) {
                this.updateAnalysis();
            }

            // Global error handler
            window.addEventListener('error', (e) => {
                console.error('Global error:', e.error);
                this.showToast('An error occurred. Please refresh if issues persist.');
            });

            // Save before unload and cleanup
            window.addEventListener('beforeunload', () => {
                this.performAutoSave();
                this.cleanup();
            });
        } catch (error) {
            console.error('Initialization error:', error);
            alert('Failed to initialize TEXTY. Please refresh the page.');
        }
    }

    cacheElements() {
        // Cache all DOM elements for performance
        this.elements.textInput = document.getElementById('textInput');
        this.elements.stripFormatBtn = document.getElementById('stripFormatBtn');
        this.elements.autoFormatBtn = document.getElementById('autoFormatBtn');
        this.elements.caseButtons = document.querySelectorAll('[data-case]');
        this.elements.loremType = document.getElementById('loremType');
        this.elements.loremCount = document.getElementById('loremCount');
        this.elements.loremStyle = document.getElementById('loremStyle');
        this.elements.loremOutput = document.getElementById('loremOutput');
        this.elements.generateBtn = document.getElementById('generateBtn');
        this.elements.copyLoremBtn = document.getElementById('copyLoremBtn');
        this.elements.clearLoremBtn = document.getElementById('clearLoremBtn');
        this.elements.wordCount = document.getElementById('wordCount');
        this.elements.uniqueWords = document.getElementById('uniqueWords');
        this.elements.charCount = document.getElementById('charCount');
        this.elements.sentenceCount = document.getElementById('sentenceCount');
        this.elements.paragraphCount = document.getElementById('paragraphCount');
        this.elements.avgWordLength = document.getElementById('avgWordLength');
        this.elements.readingTime = document.getElementById('readingTime');
        this.elements.readabilityScore = document.getElementById('readabilityScore');
        this.elements.gradeLevel = document.getElementById('gradeLevel');
        this.elements.keywordsList = document.getElementById('keywordsList');
        this.elements.formattingSection = document.getElementById('formattingSection');
        this.elements.formattingList = document.getElementById('formattingList');
        this.elements.copyTextBtn = document.getElementById('copyTextBtn');
        this.elements.clearTextBtn = document.getElementById('clearTextBtn');
        this.elements.exportTextBtn = document.getElementById('exportTextBtn');
        this.elements.themeToggle = document.getElementById('themeToggle');
        this.elements.toast = document.getElementById('toast');
    }

    bindEvents() {
        // Text input with adaptive debounced analysis
        if (this.elements.textInput) {
            this.elements.textInput.addEventListener('input', () => {
                const textLength = this.elements.textInput.value.length;

                // Enforce max length
                if (textLength > this.MAX_TEXT_LENGTH) {
                    this.elements.textInput.value = this.elements.textInput.value.substring(0, this.MAX_TEXT_LENGTH);
                    this.showToast(`Maximum text length (${this.MAX_TEXT_LENGTH.toLocaleString()} chars) reached`);
                }

                // Adaptive debouncing with single timer
                if (this.analysisTimer) {
                    clearTimeout(this.analysisTimer);
                }

                // Determine delay based on text length
                const delay = textLength > 10000 ? 500 : (textLength > 5000 ? 350 : 250);

                this.analysisTimer = setTimeout(() => {
                    this.updateAnalysis();
                    this.analysisTimer = null;
                }, delay);

                // Trigger auto-save
                this.scheduleAutoSave();
            });

            // Modern paste handler with formatting detection
            this.elements.textInput.addEventListener('paste', (e) => {
                e.preventDefault();

                // Get clipboard data
                const clipboardData = e.clipboardData || window.clipboardData;
                const pastedHtml = clipboardData.getData('text/html');
                const pastedText = clipboardData.getData('text/plain');

                // Extract formatting metadata BEFORE stripping
                if (pastedHtml) {
                    const formatting = FormattingExtractor.extractFormatting(pastedHtml);
                    this.displayFormatting(formatting);
                } else {
                    this.hideFormatting();
                }

                // Get clean text (prefer HTML stripping for better results)
                const cleanText = TextFormatter.stripFormatting(pastedHtml || pastedText);

                // Insert clean text at cursor position
                const start = this.elements.textInput.selectionStart;
                const end = this.elements.textInput.selectionEnd;
                const currentText = this.elements.textInput.value;

                this.elements.textInput.value =
                    currentText.substring(0, start) +
                    cleanText +
                    currentText.substring(end);

                // Set cursor position after inserted text
                const newCursorPos = start + cleanText.length;
                this.elements.textInput.setSelectionRange(newCursorPos, newCursorPos);

                // Update analysis immediately for paste (no debounce needed for single operation)
                this.updateAnalysis();

                // Schedule auto-save after paste
                this.scheduleAutoSave();
            });
        }

        // Button event listeners
        this.bindButtonEvent('stripFormatBtn', () => this.stripFormatting());
        this.bindButtonEvent('autoFormatBtn', () => this.autoFormat());
        this.bindButtonEvent('copyTextBtn', () => this.copyText('textInput', 'Text copied to clipboard'));
        this.bindButtonEvent('clearTextBtn', () => this.clearText('textInput'));
        this.bindButtonEvent('exportTextBtn', () => this.exportText());
        this.bindButtonEvent('generateBtn', () => this.generateLorem());
        this.bindButtonEvent('copyLoremBtn', () => this.copyText('loremOutput', 'Lorem copied to clipboard'));
        this.bindButtonEvent('clearLoremBtn', () => this.clearText('loremOutput'));
        this.bindButtonEvent('themeToggle', () => this.toggleTheme());

        // Case conversion buttons
        this.elements.caseButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.convertCase(btn.dataset.case);
            });
        });

        // Lorem settings auto-regenerate
        ['loremType', 'loremCount', 'loremStyle'].forEach(id => {
            if (this.elements[id]) {
                this.elements[id].addEventListener('change', () => this.generateLorem());
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
    }

    bindButtonEvent(elementKey, handler) {
        if (this.elements[elementKey]) {
            this.elements[elementKey].addEventListener('click', async () => {
                try {
                    await handler();
                } catch (error) {
                    console.error(`Error in ${elementKey}:`, error);
                    this.showToast('Operation failed. Please try again.');
                }
            });
        }
    }

    // === THEME MANAGEMENT ===
    setTheme(theme) {
        this.state.theme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('texty-theme', theme);
        this.updateThemeIcon(theme);
    }

    toggleTheme() {
        const newTheme = this.state.theme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
    }

    updateThemeIcon(theme) {
        if (!this.elements.themeToggle) return;
        
        const sunIcon = `<svg class="theme-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="5"/>
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
        </svg>`;
        
        const moonIcon = `<svg class="theme-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>`;
        
        this.elements.themeToggle.innerHTML = theme === 'dark' ? sunIcon : moonIcon;
    }

    // === CORE APP LOGIC ===
    updateAnalysis() {
        const text = this.elements.textInput?.value || '';

        // Use memoization - skip if text hasn't changed
        if (text === this.state.lastAnalyzedText && this.state.lastAnalysisResult) {
            return;
        }

        const analysis = TextAnalyzer.analyze(text);

        // Cache the result
        this.state.lastAnalyzedText = text;
        this.state.lastAnalysisResult = analysis;

        // Cancel any pending RAF to prevent duplicate updates
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
        }

        // Batch DOM updates to minimize reflows - use requestAnimationFrame for optimal performance
        this.rafId = requestAnimationFrame(() => {
            // Update all statistics in a single reflow with null checks
            if (this.elements.wordCount) this.elements.wordCount.textContent = TextUtils.formatNumber(analysis.words);
            if (this.elements.uniqueWords) this.elements.uniqueWords.textContent = TextUtils.formatNumber(analysis.uniqueWords);
            if (this.elements.charCount) this.elements.charCount.textContent = TextUtils.formatNumber(analysis.characters);
            if (this.elements.sentenceCount) this.elements.sentenceCount.textContent = TextUtils.formatNumber(analysis.sentences);
            if (this.elements.paragraphCount) this.elements.paragraphCount.textContent = TextUtils.formatNumber(analysis.paragraphs);
            if (this.elements.avgWordLength) this.elements.avgWordLength.textContent = analysis.avgWordLength;
            if (this.elements.readingTime) this.elements.readingTime.textContent = `${analysis.readingTime}m`;
            if (this.elements.readabilityScore) this.elements.readabilityScore.textContent = analysis.fleschScore;
            if (this.elements.gradeLevel) this.elements.gradeLevel.textContent = analysis.gradeLevel;

            this.updateKeywords(analysis.keywords);
            this.rafId = null; // Clear after execution
        });
    }

    updateKeywords(keywords) {
        if (!this.elements.keywordsList) return;

        if (keywords.length === 0) {
            this.elements.keywordsList.innerHTML = '<span class="no-keywords">Start typing to see keywords...</span>';
        } else {
            // Use DocumentFragment to build DOM off-screen, then insert once
            const fragment = document.createDocumentFragment();
            keywords.forEach(word => {
                const span = document.createElement('span');
                span.className = 'keyword-tag';
                span.textContent = word.toUpperCase();
                fragment.appendChild(span);
            });

            // Single DOM operation
            this.elements.keywordsList.textContent = ''; // Clear efficiently
            this.elements.keywordsList.appendChild(fragment);
        }
    }

    // === FORMATTING DISPLAY ===
    displayFormatting(formatting) {
        if (!this.elements.formattingSection || !this.elements.formattingList) return;

        const displayData = FormattingExtractor.formatForDisplay(formatting);

        if (!displayData || displayData.length === 0) {
            this.hideFormatting();
            return;
        }

        // Use DocumentFragment for efficient DOM construction
        const fragment = document.createDocumentFragment();

        displayData.forEach(item => {
            if (item.values.length > 0) {
                const group = document.createElement('div');
                group.className = 'formatting-group';

                const label = document.createElement('span');
                label.className = 'formatting-label';
                label.textContent = `${item.label}:`;
                group.appendChild(label);

                const valuesContainer = document.createElement('div');
                valuesContainer.className = 'formatting-values';

                if (item.label === 'Colors') {
                    // Show color swatches
                    item.values.forEach(color => {
                        const tag = document.createElement('span');
                        tag.className = 'formatting-tag color-tag';

                        const swatch = document.createElement('span');
                        swatch.className = 'color-swatch';
                        swatch.style.backgroundColor = color;

                        tag.appendChild(swatch);
                        tag.appendChild(document.createTextNode(` ${color}`));
                        valuesContainer.appendChild(tag);
                    });
                } else {
                    // Show regular tags
                    item.values.forEach(value => {
                        const tag = document.createElement('span');
                        tag.className = 'formatting-tag';
                        tag.textContent = value;
                        valuesContainer.appendChild(tag);
                    });
                }

                group.appendChild(valuesContainer);
                fragment.appendChild(group);
            }
        });

        // Single DOM operation
        this.elements.formattingList.textContent = '';
        this.elements.formattingList.appendChild(fragment);
        this.elements.formattingSection.style.display = 'block';
    }

    hideFormatting() {
        if (!this.elements.formattingSection) return;
        // Clear content to free memory
        if (this.elements.formattingList) {
            this.elements.formattingList.textContent = '';
        }
        this.elements.formattingSection.style.display = 'none';
    }

    // === TEXT PROCESSING ===
    stripFormatting() {
        if (!this.elements.textInput) return;

        try {
            this.setButtonLoading('stripFormatBtn', true);

            // Execute immediately - no artificial delay
            this.elements.textInput.value = TextFormatter.stripFormatting(this.elements.textInput.value);
            this.updateAnalysis();
            this.showToast('Formatting stripped');
        } catch (error) {
            console.error('Strip formatting error:', error);
            this.showToast('Failed to strip formatting');
        } finally {
            this.setButtonLoading('stripFormatBtn', false);
        }
    }

    autoFormat() {
        if (!this.elements.textInput) return;

        try {
            this.setButtonLoading('autoFormatBtn', true);

            // Execute immediately - no artificial delay
            this.elements.textInput.value = TextFormatter.autoFormat(this.elements.textInput.value);
            this.updateAnalysis();
            this.showToast('Text auto-formatted');
        } catch (error) {
            console.error('Auto format error:', error);
            this.showToast('Failed to format text');
        } finally {
            this.setButtonLoading('autoFormatBtn', false);
        }
    }

    convertCase(caseType) {
        if (!this.elements.textInput) return;
        
        this.elements.textInput.value = CaseConverter.convert(this.elements.textInput.value, caseType);
        this.updateAnalysis();
        this.showToast(`Converted to ${caseType} case`);
    }

    // === LOREM GENERATOR ===
    generateLorem() {
        if (!this.elements.loremOutput) return;

        this.setButtonLoading('generateBtn', true);

        // Execute immediately - no artificial delay
        const type = this.elements.loremType?.value || 'paragraphs';
        const count = parseInt(this.elements.loremCount?.value) || 3;
        const style = this.elements.loremStyle?.value || 'english';

        this.elements.loremOutput.value = LoremGenerator.generate(type, count, style);
        this.setButtonLoading('generateBtn', false);
        this.showToast('Lorem text generated');
    }
    
    // === UTILITY METHODS ===
    generateInitialLorem() {
        if (this.elements.loremOutput && !this.elements.loremOutput.value) {
            this.generateLorem();
        }
    }

    setCurrentYear() {
        const yearElement = document.getElementById('currentYear');
        if (yearElement) {
            yearElement.textContent = new Date().getFullYear();
        }
    }

    async copyText(elementId, message = 'Copied to clipboard') {
        const element = this.elements[elementId];
        if (!element || !element.value) {
            this.showToast('Nothing to copy');
            return;
        }
        
        try {
            await TextUtils.copyToClipboard(element.value);
            this.showToast(message);
        } catch (err) {
            this.showToast('Failed to copy');
        }
    }

    clearText(elementId) {
        const element = this.elements[elementId];
        if (element) {
            element.value = '';
            if (elementId === 'textInput') {
                this.updateAnalysis();
                this.hideFormatting();
                // Clear auto-save when manually clearing text
                localStorage.removeItem('texty-autosave');
                localStorage.removeItem('texty-autosave-time');
            }
            this.showToast('Text cleared');
        }
    }

    // === AUTO-SAVE ===
    scheduleAutoSave() {
        // Clear existing timer
        if (this.autoSaveTimer) {
            clearTimeout(this.autoSaveTimer);
        }

        // Schedule new auto-save
        this.autoSaveTimer = setTimeout(() => {
            this.performAutoSave();
        }, this.AUTOSAVE_INTERVAL);
    }

    performAutoSave() {
        const text = this.elements.textInput?.value;
        if (text && text.length > 0) {
            try {
                localStorage.setItem('texty-autosave', text);
                localStorage.setItem('texty-autosave-time', Date.now().toString());
            } catch (error) {
                console.error('Auto-save failed:', error);
                // Silent fail - don't bother user with storage errors
            }
        }
    }

    restoreAutoSave() {
        try {
            const saved = localStorage.getItem('texty-autosave');
            const savedTime = localStorage.getItem('texty-autosave-time');

            if (saved && savedTime) {
                const hoursSince = (Date.now() - parseInt(savedTime)) / (1000 * 60 * 60);

                // Only restore if less than 24 hours old and textarea is empty
                if (hoursSince < 24 && (!this.elements.textInput.value || this.elements.textInput.value.length === 0)) {
                    this.elements.textInput.value = saved;
                    this.showToast('Previous session restored');
                }
            }
        } catch (error) {
            console.error('Failed to restore auto-save:', error);
            // Silent fail
        }
    }

    exportText() {
        if (!this.elements.textInput || !this.elements.textInput.value) {
            this.showToast('Nothing to export');
            return;
        }

        try {
            const text = this.elements.textInput.value;
            const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
            const filename = `texty-export-${timestamp}.txt`;

            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();

            // Cleanup
            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 100);

            this.showToast('Text exported successfully');
        } catch (error) {
            console.error('Export failed:', error);
            this.showToast('Export failed. Please try again.');
        }
    }

    setButtonLoading(buttonId, loading) {
        const button = this.elements[buttonId];
        if (button) {
            if (loading) {
                button.classList.add('loading');
                button.disabled = true;
            } else {
                button.classList.remove('loading');
                button.disabled = false;
            }
        }
    }

    showToast(message) {
        if (!this.elements.toast) return;

        // Clear any existing toast timer to prevent overlaps
        if (this.toastTimer) {
            clearTimeout(this.toastTimer);
            this.elements.toast.classList.remove('show');
        }

        const messageElement = this.elements.toast.querySelector('.toast-message');
        if (messageElement) {
            messageElement.textContent = message;
        }

        // Use requestAnimationFrame for smooth animation
        requestAnimationFrame(() => {
            this.elements.toast.classList.add('show');
        });

        this.toastTimer = setTimeout(() => {
            this.elements.toast.classList.remove('show');
            this.toastTimer = null;
        }, 2500);
    }

    // === KEYBOARD SHORTCUTS ===
    handleKeyboardShortcuts(e) {
        // Only use non-conflicting shortcuts with Shift modifier
        if ((e.ctrlKey || e.metaKey) && e.shiftKey) {
            switch(e.key.toLowerCase()) {
                case 'c':
                    e.preventDefault();
                    this.copyText('textInput', 'Text copied to clipboard');
                    break;
                case 'e':
                    e.preventDefault();
                    this.exportText();
                    break;
                case 'l':
                    e.preventDefault();
                    this.clearText('textInput');
                    break;
            }
        }

        // Escape key closes toast
        if (e.key === 'Escape') {
            if (this.elements.toast?.classList.contains('show')) {
                this.elements.toast.classList.remove('show');
            }
        }
    }

    // === CLEANUP ===
    cleanup() {
        // Clear all timers to prevent memory leaks
        if (this.autoSaveTimer) {
            clearTimeout(this.autoSaveTimer);
            this.autoSaveTimer = null;
        }
        if (this.analysisTimer) {
            clearTimeout(this.analysisTimer);
            this.analysisTimer = null;
        }
        if (this.toastTimer) {
            clearTimeout(this.toastTimer);
            this.toastTimer = null;
        }
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }
    }
}

// === APPLICATION STARTUP ===
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.textyApp = new TextyApp();
    } catch (error) {
        console.error('Failed to initialize TEXTY:', error);
    }
});

// === KEYBOARD SHORTCUTS HELP ===
document.addEventListener('keydown', (e) => {
    if (e.key === '?' && e.shiftKey && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        alert(`TEXTY Keyboard Shortcuts:

Ctrl/Cmd + Shift + C - Copy text
Ctrl/Cmd + Shift + E - Export as TXT
Ctrl/Cmd + Shift + L - Clear text
Shift + ? - Show this help
Escape - Close notifications

Note: Auto-save runs every 30 seconds automatically.`);
    }
});
