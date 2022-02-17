import { createStore } from 'vuex'
import audio from './modules/audio'
import nav from './modules/nav'
import panel from './modules/panel'
import playlist from './modules/playlist'

const store = createStore({
    modules: {
        audio,
        nav,
        panel,
        playlist,
    }
})

export default store