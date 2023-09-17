'use client'
import React, { createContext, useContext, useEffect, useState, useRef } from 'react'
import { auth } from '../../firebase'
import { onAuthStateChanged } from '@firebase/auth'

const AuthContext = createContext({
	currentUser: null,
	userInfo: null,
	login: async () => { },
	logout: async () => { },
})


export function useAuth() {
	return useContext(AuthContext)
}

export function AuthProvider({ children }) {
	const [currentUser, setCurrentUser] = useState(null)
	const userInfo = useRef()
	const login = async (email, password) => {
		await auth.signInWithEmailAndPassword(email, password)
	}

	const logout = async () => {
		await auth.signOut()
	}

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (user) => {
			setCurrentUser(user)
		})

		return () => {
			unsubscribe() // Unsubscribe when the component unmounts
		}
	}, [])

	const value = {
		currentUser,
		userInfo,
		login,
		logout,
	}

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
