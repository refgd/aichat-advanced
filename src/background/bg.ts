import Browser from 'webextension-polyfill'
import { getHtml } from 'src/content-scripts/ddg_search'
import { getWebpageTitleAndText } from 'src/content-scripts/api'


const manifest_version = Browser.runtime.getManifest().manifest_version

function openChatGPTWebpage() {
    Browser.tabs.query({ currentWindow: true }).then((tabs) => {
        const gptTab = tabs.find((tab) => tab.url && tab.id  && tab.url.startsWith("https://chat.openai.com/"));
        
        if(gptTab && gptTab.id){
            chrome.tabs.update(gptTab.id, { active: true });
        }else{
            Browser.tabs.create({
                url: "https://chat.openai.com/?model=gpt-4",
            })
        }
    })
}

function openBardWebpage() {
    Browser.tabs.query({ currentWindow: true }).then((tabs) => {
        const gptTab = tabs.find((tab) => tab.url && tab.id  && tab.url.startsWith("https://bard.google.com/"));
        
        if(gptTab && gptTab.id){
            chrome.tabs.update(gptTab.id, { active: true });
        }else{
            Browser.tabs.create({
                url: "https://bard.google.com",
            })
        }
    })
}

if (manifest_version == 2) {
    // Browser.browserAction.onClicked.addListener(openPopupWindow)
    update_origin_for_ddg_in_firefox()
} else {
    // Browser.action.onClicked.addListener(openPopupWindow)
}

Browser.runtime.onMessage.addListener((message) => {
    if (message.type === "show_options") {
        Browser.runtime.openOptionsPage();
        return
    }

    if (message.type === "get_search_results") {
        return getHtml(message.search)
    }

    if (message.type === "openChatGPTWebpage") {
        return openChatGPTWebpage()
    }

    if (message.type === "openBardWebpage") {
        return openBardWebpage()
    }
})

// Firefox does not support declarativeNetRequest.updateDynamicRules yet
Browser.declarativeNetRequest.updateDynamicRules({
    addRules: [
        {
            id: 1,
            priority: 1,
            action: {
                type: "modifyHeaders",
                requestHeaders: [
                    {
                        header: "Origin",
                        operation: "set",
                        value: "https://lite.duckduckgo.com"
                    },
                ],
            },

            condition: {
                urlFilter: "https://lite.duckduckgo.com/*",
                resourceTypes: ["xmlhttprequest"],
            },
        },
    ],
    removeRuleIds: [1],
})

function update_origin_for_ddg_in_firefox() {
    Browser.webRequest.onBeforeSendHeaders.addListener(
        (details) => {
            if (!details.requestHeaders) return
            for (let i = 0; i < details.requestHeaders.length; ++i) {
                if (details.requestHeaders[i].name === 'Origin')
                    details.requestHeaders[i].value = "https://lite.duckduckgo.com"
            }

            return {
                requestHeaders: details.requestHeaders
            }
        }, {
        urls: ["https://lite.duckduckgo.com/*"],
    },
        ["blocking", "requestHeaders"]
    )
}