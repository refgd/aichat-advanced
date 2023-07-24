export function getTextArea(): HTMLTextAreaElement {
    return document.querySelector('textarea')
}

export function getFooter(): HTMLDivElement {
    return document.querySelector("div[class*='absolute bottom-0']")
}

export function getRootElement(): HTMLDivElement {
    let root = document.querySelector('div[id="__next"]');
    if(!root) root = document.querySelector('chat-app');
    return root
}

export function getAIChatToolbar(): HTMLElement {
    return document.querySelector("div[class*='wcg-toolbar']")
}

export function getSubmitButton(): HTMLButtonElement {
    const textarea = getTextArea()
    if (!textarea) {
        return null
    }
    if (textarea.hasAttribute('matinput')) {
        return textarea.parentNode.parentNode.parentNode.parentNode.parentNode.querySelector(".send-button-container button")
    }else{
        return textarea.parentNode.querySelector("button")
    }
}
