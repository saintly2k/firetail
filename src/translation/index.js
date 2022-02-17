import { createI18n } from 'vue-i18n'
import {ipcRenderer} from 'electron'

let loadLocaleMessages = () => {
    const locales = require.context('./locales', true, /[A-Za-z0-9-_,\s]+\.json$/i)
    const messages = {}
    locales.keys().forEach(key => {
        const matched = key.match(/([A-Za-z0-9-_]+)\./i)
        if (matched && matched.length > 1) {
            const locale = matched[1]
            messages[locale] = locales(key)
        }
    })
    return messages
}

let getLocale = async () => {
    let locale = await ipcRenderer.invoke('hasCustomLanguage')
    console.log(locale)
    if (locale) {
        i18n.locale = locale
    } else {
        i18n.locale = navigator.language.split('-')[0]
    }
}
getLocale()

let i18n = createI18n({
    locale: navigator.language.split('-')[0],
    fallbackLocale: 'en',
    messages: loadLocaleMessages()
})

export default i18n