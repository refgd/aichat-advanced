export function getTextArea(): HTMLTextAreaElement | null {
    let textarea = document.querySelector('textarea');
    if(!textarea) textarea = document.querySelector('.textarea');
    return textarea
}

export function getFooter(): HTMLDivElement | null {
    return document.querySelector("div[class*='absolute bottom-0']")
}

export function getRootElement(): Element | null {
    let root = document.querySelector('div[id="__next"]');
    if(!root) root = document.querySelector('chat-app');
    return root
}

export function getAIChatToolbar(): HTMLElement | null {
    return document.querySelector("div[class*='wcg-toolbar']")
}

export function getSubmitButton(): HTMLButtonElement | null | undefined {
    const textarea = getTextArea()
    if (!textarea) {
        return null
    }
    if (textarea.tagName !== 'TEXTAREA') {
        return textarea.parentNode?.parentNode?.parentNode?.parentNode?.parentNode?.querySelector(".send-button-container button")
    }else{
        return textarea.parentNode?.parentNode?.querySelector(":scope > button")
    }
}
