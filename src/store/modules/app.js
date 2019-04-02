const app = {
	state: {
		skipPage: 1,
		isSkip: false,
		leftNavState: 'home',
		collapsed: false
	},
	mutations: {
		SET_SKIPPAGE: (state, skipPage) => {
			state.skipPage = skipPage
		},
		SET_ISFALSE: (state, isSkip) => {
			state.isSkip = isSkip
		},
		SET_LEFTNAVSTATE: (state, leftNavState) => {
			state.leftNavState = leftNavState
		},
	},
	actions: {
		setSkipPage({ commit }, skipPage) {
			commit('SET_SKIPPAGE', skipPage)
		},
		setIsSkip({ commit }, isSkip) {
			commit('SET_ISFALSE', isSkip)
		},
		setLeftNavState({ commit }, leftNavState) {
			commit('SET_LEFTNAVSTATE', leftNavState)
		}
	}
}

export default app