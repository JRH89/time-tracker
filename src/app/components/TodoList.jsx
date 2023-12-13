'use client'
import React, { useState, useEffect } from 'react'
import { auth, db } from '../../../firebase'
import {
	doc,
	getDoc,
	updateDoc,
} from 'firebase/firestore'
import { useAuth } from '@/context/AuthProvider'
import { useRouter } from 'next/navigation'
import Footer from '@/app/components/Footer'

const TodoList = ({ projectId, currentUser }) => {
	const [todos, setTodos] = useState([])
	const [newTodo, setNewTodo] = useState('')

	useEffect(() => {
		// Fetch ToDo list from Firestore when the component mounts
		const fetchTodos = async () => {
			try {
				if (currentUser && projectId) {
					const projectRef = doc(db, `users/${currentUser.uid}/projects/${projectId}`)
					const projectDoc = await getDoc(projectRef)

					if (projectDoc.exists()) {
						const projectData = projectDoc.data()
						setTodos(projectData.todos || [])
					}
				}
			} catch (error) {
				console.error('Error fetching ToDo list:', error)
			}
		}

		fetchTodos()
	}, [currentUser, projectId])

	const addTodo = async () => {
		try {
			if (newTodo.trim() !== '' && currentUser && projectId) {
				const projectRef = doc(db, `users/${currentUser.uid}/projects/${projectId}`)
				const projectDoc = await getDoc(projectRef)

				if (projectDoc.exists()) {
					const projectData = projectDoc.data()
					const currentTodos = projectData.todos || [] // Check if todos exists

					const updatedTodos = [...currentTodos, { text: newTodo, completed: false }]

					// Update Firestore document with the new ToDo list
					await updateDoc(projectRef, { todos: updatedTodos })

					setTodos(updatedTodos)
					setNewTodo('')
				}
			}
		} catch (error) {
			console.error('Error adding ToDo:', error)
		}
	}

	const removeTodo = async (index) => {
		try {
			if (currentUser && projectId) {
				const projectRef = doc(db, `users/${currentUser.uid}/projects/${projectId}`)
				const projectDoc = await getDoc(projectRef)

				if (projectDoc.exists()) {
					const projectData = projectDoc.data()
					const currentTodos = projectData.todos || [] // Check if todos exists

					const updatedTodos = currentTodos.filter((_, i) => i !== index)

					// Update Firestore document with the updated ToDo list
					await updateDoc(projectRef, { todos: updatedTodos })

					setTodos(updatedTodos)
				}
			}
		} catch (error) {
			console.error('Error removing ToDo:', error)
		}
	}


	return (
		<div className='bg-neutral-300 px-2 py-4 rounded-md border border-gray-800 flex flex-col'>
			<h3 className="text-lg text-center underline font-semibold text-gray-800 mb-2">ToDo List</h3>
			<div className="flex gap-2 mb-4">
				<input
					type="text"
					value={newTodo}
					onChange={(e) => setNewTodo(e.target.value)}
					placeholder="Add a new ToDo"
					className="border border-gray-400 text-gray-800 p-2 rounded-lg flex-grow"
				/>
				<button
					onClick={addTodo}
					className="px-4 py-2 bg-blue-400 border border-gray-800 text-gray-800 rounded-lg hover:bg-blue-600"
				>
					Add
				</button>
			</div>

			<ul className='h-40 max-60 pb-4 overflow-y-auto overflow-x-hidden'>
				{todos.map((todo, index) => (
					<li
						key={index}
						className={`text-gray-800 flex justify-between items-center ${todo.completed ? 'line-through' : ''
							}`}
					>
						<span className=' break-words flex-wrap border-b w-full border-gray-800'>{index + 1}. {todo.text}</span>
						<button onClick={() => removeTodo(index)} className="text-red-600">
							<i className='fa fa-xmark px-2 hover:rotate-90 duration-300'></i>
						</button>
					</li>
				))}
			</ul>
		</div>
	)
}

export default TodoList
