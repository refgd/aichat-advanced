import '../style/base.css'
import { h, render } from 'preact'
import { getTextArea, getFooter, getRootElement, getSubmitButton, getAIChatToolbar } from '../util/elementFinder'
import Toolbar from 'src/components/toolbar'
import ErrorMessage from 'src/components/errorMessage'
import { getUserConfig, UserConfig } from 'src/util/userConfig'
import { SearchRequest, SearchResult, webSearch } from './ddg_search'

import createShadowRoot from 'src/util/createShadowRoot'
import { compilePrompt, promptContainsWebResults } from 'src/util/promptManager'
import SlashCommandsMenu, { slashCommands } from 'src/components/slashCommandsMenu'
import { apiExtractText } from './api'

let isProcessing = false
let updatingUI = false
let hasError = false

const rootEl = getRootElement()
const uuid = {setValue: (uuid: string) => {}};

let btnSubmit: HTMLButtonElement | null | undefined
let textarea: HTMLTextAreaElement | null
let aiChatFooter: HTMLDivElement | null
let toolbar: HTMLElement | null


function renderSlashCommandsMenu() {

    let div = document.querySelector('div.wcg-slash-commands-menu')
    if (div) div.remove()

    div = document.createElement('div')
    div.className = "wcg-slash-commands-menu"
    const textareaParentParent = textarea?.parentElement?.parentElement

    textareaParentParent?.insertBefore(div, textareaParentParent.firstChild)
    render(<SlashCommandsMenu textarea={textarea} />, div)
}

async function processQuery(query: string, userConfig: UserConfig) {

    const containsWebResults = await promptContainsWebResults()
    if (!containsWebResults) {
        return undefined
    }

    let results: SearchResult[]

    const pageCommandMatch = query.match(/page:(\S+)/)
    if (pageCommandMatch) {
        const url = pageCommandMatch[1]
        results = await apiExtractText(url)
    } else {
        const searchRequest: SearchRequest = {
            query,
            timerange: userConfig.timePeriod,
            region: userConfig.region,
        }

        results = await webSearch(searchRequest, userConfig.numWebResults)
    }

    return results
}

async function handleSubmit(query: string) {

    if (!textarea) return

    const userConfig = await getUserConfig()

    if (!userConfig.extActive) {
        if(textarea.tagName !== 'TEXTAREA'){
            textarea.innerText = query
        }else{
            textarea.value = query
        }
        setTimeout(() => {
            pressEnter()
        }, 100);
        return
    }

    try {
        const results = await processQuery(query, userConfig)
        const compiledPrompt = await compilePrompt(results, query)
        
        if(textarea.tagName !== 'TEXTAREA'){
            if (textarea?.id === 'prompt-textarea') {
                textarea.innerHTML = '<p>'+compiledPrompt.split("\n").join('</p><p>')+'</p>';
            }else{
                textarea.innerText = compiledPrompt
            }
        }else{
            textarea.value = compiledPrompt
        }

        setTimeout(() => {
            pressEnter()
        }, 100);
    } catch (error) {
        if (error instanceof Error) {
            showErrorMessage(error)
        }
    }
}

async function onSubmit(event: MouseEvent | KeyboardEvent) {

    if (!textarea) return
    const isKeyEvent = event instanceof KeyboardEvent

    if (isKeyEvent && event.shiftKey && event.key === 'Enter') return

    if (isKeyEvent && event.key === 'Enter' && event.isComposing) return
    
    if (!isProcessing && (event.type === "click" || (isKeyEvent && event.key === 'Enter'))) {
        let query = null;
        if(textarea.tagName !== 'TEXTAREA'){
            query = textarea.innerText.trim()
        }else{
            query = textarea?.value.trim()
        }
        
        if (!query) return

        event.preventDefault();
        event.stopImmediatePropagation();

        if(textarea.tagName !== 'TEXTAREA'){
            textarea.innerText = ''
        }else{
            textarea.value = ''
        }

        const isPartialCommand = slashCommands.some(command => command.name.startsWith(query) && query.length <= command.name.length)
        if (isPartialCommand) {
            return
        }

        isProcessing = true
        await handleSubmit(query)
        // setTimeout(() => {
        //     isProcessing = false
        // }, 500);
        
        uuid.setValue('noprompt');

        return
    }
}

function pressEnter() {
    textarea?.focus()

    const inputEvent = new KeyboardEvent('input', {
        bubbles: true,
        cancelable: true
    })
    textarea?.dispatchEvent(inputEvent)

    const enterEvent = new KeyboardEvent('keydown', {
        bubbles: true,
        cancelable: true,
        key: 'Enter',
        code: 'Enter'
    })
    textarea?.dispatchEvent(enterEvent)

    isProcessing = false
}

function showErrorMessage(error: Error) {
    console.info("AIChat Advanced error --> API error: ", error)
    const div = document.createElement('div')
    document.body.appendChild(div)
    render(<ErrorMessage message={error.message} />, div)
}


async function updateUI() {
    if (updatingUI || hasError) return
    updatingUI = true

    if(!textarea || !document.body.contains(textarea)){
        if(textarea) textarea.removeEventListener("keydown", onSubmit, true);

        textarea = getTextArea();

        if (!textarea) {
            toolbar?.remove()

            updatingUI = false
            return
        }

        textarea?.removeEventListener("keydown", onSubmit, true);
        textarea?.addEventListener("keydown", onSubmit, true)
    }

    if(!btnSubmit || !document.body.contains(btnSubmit)){
        if(btnSubmit) btnSubmit.removeEventListener("click", onSubmit, true);

        btnSubmit = getSubmitButton()
        
        btnSubmit?.removeEventListener("click", onSubmit, true)
        btnSubmit?.addEventListener("click", onSubmit, true)
    }

    if(!toolbar || !document.body.contains(toolbar)){
        toolbar = getAIChatToolbar()
        if (!toolbar) {
            await renderToolbar()
            renderSlashCommandsMenu()
        
            aiChatFooter = getFooter()
            if (aiChatFooter) {
                const lastChild = aiChatFooter.lastElementChild as HTMLElement
                if (lastChild) lastChild.style.padding = '0 0 0.5em 0'
            }
        }
    }

    updatingUI = false
}

async function renderToolbar() {

    try {
        const { shadowRootDiv, shadowRoot } = await createShadowRoot('content-scripts/mainUI.css')
        shadowRootDiv.classList.add('wcg-toolbar')

        if (textarea?.id !== 'prompt-textarea') {
            const textareaParentParent = textarea?.parentElement?.parentElement?.parentElement?.parentElement?.parentElement?.parentElement?.parentElement
            textareaParentParent?.classList.add('flex-col')
            textareaParentParent?.appendChild(shadowRootDiv)
        }else{
            const textareaParentParent = textarea?.parentElement?.parentElement?.parentElement?.parentElement
            textareaParentParent?.classList.add('flex-col')
            textareaParentParent?.appendChild(shadowRootDiv)
        }

        render(<Toolbar textarea={textarea} uuid={uuid} />, shadowRoot)

    } catch (e) {
        if (e instanceof Error) {
            hasError = true;
            showErrorMessage(Error(`Error loading AIChat Advanced toolbar: ${e.message}. Please reload the page (F5).`))
        }
    }
}


const mutationObserver = new MutationObserver((mutations) => {
    
    if (!mutations.some(mutation => mutation.removedNodes.length > 0)) return

    // console.info("AIChat Advanced: Mutation observer triggered")
    
    // if (getAIChatToolbar()) return

    try {
        updateUI()
    } catch (e) {
        if (e instanceof Error) {
            showErrorMessage(e)
        }
    }
})

window.onload = function () {
    updateUI()
    
    if(rootEl) mutationObserver.observe(rootEl, { childList: true, subtree: true })
}

window.onunload = function () {
    mutationObserver.disconnect()
}
