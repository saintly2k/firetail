import { ipcRenderer } from 'electron'
import sort from '../../modules/sort'
import tr from '../../translation'
import store from '..'

const state = () => ({
    navs: [{
        icon: 'home',
        name: tr.t('sidebar.home'),
        id: 'homeTab',
        type: 'large_button',
        link: '/home'
    },
    {
        icon: 'settings',
        name: tr.t('sidebar.settings'),
        id: 'settingsTab',
        type: 'large_button',
        link: '/settings'
    },
    {
        name: tr.t('sidebar.library'),
        type: 'subtitle'
    },
    {
        icon: 'heart',
        name: tr.t('sidebar.favourite'),
        id: 'likedTab',
        type: 'large_button',
        link: '/liked'
    },
    {
        icon: 'note',
        name: tr.t('sidebar.songs'),
        id: 'songsTab',
        type: 'large_button',
        link: `/?name=${encodeURIComponent(tr.t('sidebar.songs'))}&view=all`
    },
    {
        icon: 'person',
        name: tr.t('sidebar.artists'),
        id: 'artistsTab',
        type: 'large_button',
        link: '/artists?hideTop=true&view=firetailnoselect'
    },
    {
        icon: 'album',
        name: tr.t('sidebar.albums'),
        id: 'albumsTab',
        type: 'large_button',
        link: '/albums?hideTop=true&view=firetailnoselect'
    },
    {
        name: tr.t('sidebar.playlists'),
        type: 'subtitle'
    },
    {
        name: 'Create Playlist',
        id: 'createPlaylist',
        icon: 'add',
        type: 'special_button',
        action() {
            store.commit('panel/invokeNewPanel', {
                component: 'Playlist',
                newProps: {
                    topMsg: 'Create Playlist'
                }
            })
        }
    }
    ],
    screenTitle: '',
    screenCountType: tr.tc('topTitle.countTypeSongs', 0),
    screenCountNum: 0,
    showScreenTop: true,
    artists: [],
    albums: [],
    currentView: 'all',
    playingView: null,
    favouriteSongs: [],
    scrolled: 0,
    playingBarColour: null,
    ver: 'unknown',
    buildNum: 'unknown',
    port: '0',
    isCDBurnEnable: false,
    albumViewCurrentArt: '',
    fullscreen: false,
    zenMoveMouseActive: false,
    spotifyDetails: {
        name: 'unknown',
        uri: 'unknown'
    },
    isSpotifyConnected: false,
    checkNav: {
        back: false,
        forward: false
    },
    advancedFileInfo: window.localStorage.getItem('advancedFileInfo') === 'true'
})

const mutations = {
    updateScreenCountNum(state, num) {
        state.screenCountNum = num
    },
    updateScreenTitle(state, title) {
        state.screenTitle = title
    },
    updateTopVisible(state, show) {
        state.showScreenTop = show
    },
    updateArtists(state, artists) {
        let sortedArtists = sort.sortArray(artists, 'artist')
        state.artists = sortedArtists
    },
    updateAlbums(state, albums) {
        let sortedAlbums = sort.sortArray(albums, 'album')
        state.albums = sortedAlbums
    },
    updateCurrentView(state, view) {
        state.currentView = view
    },
    updatePlayingView(state, view) {
        state.playingView = view
    },
    updateFavouriteSongs(state, ids) {
        state.favouriteSongs = ids
    },
    updateCurrentScroll(state, scrolled) {
        state.scrolled = scrolled
    },
    updatePlayingBarColour(state, colour) {
        state.playingBarColour = colour
    },
    updateVer(state, ver) {
        state.ver = ver
    },
    updateBuildNum(state, buildNum) {
        state.buildNum = buildNum
    },
    updatePort(state, port) {
        state.port = port
    },
    addItemToNav(state, item) {
        state.navs.push(item)
    },
    enableCDBurn(state) {
        state.isCDBurnEnable = true
    },
    updateAlbumViewCurrentArt(state, url) {
        state.albumViewCurrentArt = url
    },
    updateFullscreen(state, isFull) {
        state.fullscreen = isFull
        if (!isFull) {
            state.zenMoveMouseActive = true
        }
    },
    updateZenMouse(state, moved) {
        state.zenMoveMouseActive = moved
    },
    updateSpotifyDetails(state, details) {
        state.spotifyDetails = {
            name: details.name,
            uri: details.uri
        }
    },
    updateSpotifyActive(state, isActive) {
        state.isSpotifyConnected = isActive
    },
    updateCheckNav(state, nav) {
        state.checkNav = nav
    },
    updateAdvancedFileInfo(state, enabled) {
        state.advancedFileInfo = enabled
    }
}

const actions = {
    requestColumn(context, type) {
        ipcRenderer.send('getSomeFromColumna', type)
    }
}

export default {
    namespaced: true,
    state,
    mutations,
    actions
}