'use client'
import React, { useState, useEffect } from 'react'
import { auth, db } from '../../../../firebase'
import {
	doc,
	getDoc,
	updateDoc,
} from 'firebase/firestore'
import { useAuth } from '@/context/AuthProvider'
import { useRouter } from 'next/navigation'
import Footer from '@/app/components/Footer'
import TodoList from '@/app/components/TodoList'

const ProjectDetails = () => {
	const { currentUser } = useAuth()
	const router = useRouter()

	const [projectId, setProjectId] = useState(null)
	const [project, setProject] = useState(null)
	const [sessionHours, setSessionHours] = useState(0)
	const [sessionMinutes, setSessionMinutes] = useState(0)
	const [sessionSeconds, setSessionSeconds] = useState(0)
	const [totalHours, setTotalHours] = useState(0)
	const [totalMinutes, setTotalMinutes] = useState(0)
	const [totalSeconds, setTotalSeconds] = useState(0)
	const [sessionTimer, setSessionTimer] = useState(0)
	const [isTimerRunning, setIsTimerRunning] = useState(false)
	const [isLoading, setIsLoading] = useState(true)
	const [timesheet, setTimesheet] = useState([])
	const [showTimeCard, setShowTimeCard] = useState(false)
	const [showSummary, setShowSummary] = useState(true)

	useEffect(() => {
		const currentUrl = window.location.href
		const extractedProjectId = currentUrl.substring(currentUrl.lastIndexOf('/') + 1)
		setProjectId(extractedProjectId)
	}, [])

	const fetchProjectDetails = async () => {
		try {
			if (currentUser && projectId) {
				const projectRef = doc(db, 'users', currentUser.uid, 'projects', projectId)
				const projectDoc = await getDoc(projectRef)

				if (projectDoc.exists()) {
					const projectData = projectDoc.data()
					setProject(projectData)
					setTimesheet(projectData.timesheet || [])
					const totalTime = projectData.time || 0
					setTotalHours(Math.floor(totalTime / 3600))
					setTotalMinutes(Math.floor((totalTime % 3600) / 60))
					setTotalSeconds(totalTime % 60)
				}
			}
		} catch (error) {
			console.error('Error fetching project details:', error)
		} finally {
			setIsLoading(false)
		}
	}

	useEffect(() => {
		fetchProjectDetails()
	}, [currentUser, projectId])

	const handleStartTimer = async () => {
		setIsTimerRunning(true)

		const currentTime = Date.now()

		if (currentUser) {
			const projectRef = doc(db, 'users', currentUser.uid, 'projects', projectId)
			await updateDoc(projectRef, {
				timesheet: [
					...timesheet,
					{ type: 'in', timestamp: currentTime },
				],
			})
		}

		setTimesheet(prevTimesheet => [
			...prevTimesheet,
			{ type: 'in', timestamp: currentTime },
		])

		const sessionTimerInterval = setInterval(() => {
			setSessionSeconds(prevSeconds => {
				let newSeconds = prevSeconds + 1
				if (newSeconds === 60) {
					newSeconds = 0
					setSessionMinutes(prevMinutes => {
						let newMinutes = prevMinutes + 1
						if (newMinutes === 60) {
							newMinutes = 0
							setSessionHours(prevHours => prevHours + 1)
						}
						return newMinutes
					})
				}
				return newSeconds
			})
		}, 1000)

		setSessionTimer(sessionTimerInterval)
	}

	const handleStopTimer = async () => {
		setIsTimerRunning(false)
		clearInterval(sessionTimer)

		const currentTime = Date.now()

		setTimesheet(prevTimesheet => [
			...prevTimesheet,
			{ type: 'out', timestamp: currentTime },
		])

		const sessionTimeInSeconds = sessionHours * 3600 + sessionMinutes * 60 + sessionSeconds
		const updatedTotalTime = totalHours * 3600 + totalMinutes * 60 + totalSeconds + sessionTimeInSeconds

		if (currentUser) {
			const projectRef = doc(db, 'users', currentUser.uid, 'projects', projectId)
			await updateDoc(projectRef, {
				timesheet: [
					...timesheet,
					{ type: 'out', timestamp: currentTime },
				],
				time: (project.time ?? 0) + sessionTimeInSeconds,
			})
		}

		setTotalHours(Math.floor(updatedTotalTime / 3600))
		setTotalMinutes(Math.floor((updatedTotalTime % 3600) / 60))
		setTotalSeconds(updatedTotalTime % 60)
		setSessionHours(0)
		setSessionMinutes(0)
		setSessionSeconds(0)
	}

	const formatTime = (hours, minutes, seconds) => {
		const formattedHours = String(hours).padStart(2, '0')
		const formattedMinutes = String(minutes).padStart(2, '0')
		const formattedSeconds = String(seconds).padStart(2, '0')
		return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`
	}

	return (
		<>
			<div className="bg-stone-300 min-h-screen flex w-full mx-auto my-auto justify-center items-center px-2 py-4">
				<div className=" p-8 bg-white shadow-black rounded-lg shadow-lg">
					{isLoading ? (
						<p className="text-center text-gray-800 text-xl font-semibold">
							Loading project details...
						</p>
					) : project ? (
						<>
							<div className="mx-auto flex flex-col items-center">
								<button
									className="fixed top-1 right-1 mt-2 mr-2 bg-red-400 text-gray-800 rounded-lg px-3 py-1 font-bold hover:bg-red-600 text-xl"
									onClick={() => router.push('/')}
								>
									X
								</button>
								<h2 className="text-xl font-semibold text-center mb-4 text-gray-800">
									{project.title}
								</h2>
								<div className='w-full h-full flex flex-col gap-3'>
									<div className=" flex flex-1  bg-neutral-300 rounded-md border border-gray-800 w-full h-auto">
										<div className='self-center text-left justify-center flex flex-col mx-auto my-auto w-full'>
											<p onClick={() => setShowSummary(!showSummary)} className="text-lg cursor-pointer hover:scale-95 duration-200 text-center underline  font-semibold text-gray-800 mb-2 pt-1">About</p>

											{showSummary && <>
												<div className='pb-2 px-2'>
													<p className="mb-2 text-base  text-gray-800">
														<b>About:</b> {project.description}
													</p>
													<p className="mb-2 text-base  text-gray-800">
														<b>Hourly:</b>{' '}
														<span className="text-yellow-600">${project.hourlyRate}</span>
													</p>
													<p className="mb-2 text-base  text-gray-800">
														<b>Time:</b>{' '}
														<span className="text-green-600">
															{formatTime(totalHours, totalMinutes, totalSeconds)}
														</span>
													</p>
													<p className=" text-base  text-gray-800">
														<b>Cost:</b>{' '}
														<span className="text-yellow-600">
															$
															{(
																project.hourlyRate *
																((totalHours + totalMinutes / 60 + totalSeconds / 3600) / 10)
															).toFixed(2)}
														</span>
													</p>
												</div>
											</>}
										</div>
									</div>
									<div id='todo' className='w-full flex  flex-1 justify-center self-center align-middle'>
										<TodoList projectId={projectId} currentUser={currentUser} />
									</div>
									<div className='w-full mx-auto h-full flex flex-1 my-auto items-center align-middle self-center'>
										{/* Display timesheet */}
										<div id='timecard' className='bg-neutral-300 py-4 border  h-full self-center my-auto  border-neutral-950  w-full align-middle rounded-lg p-2 flex flex-col mx-auto justify-center'>
											<h3 onClick={() => setShowTimeCard(!showTimeCard)} className="text-lg cursor-pointer hover:scale-95 duration-200 text-center underline  font-semibold text-gray-800 mb-2 ">Time</h3>
											{showTimeCard && <>
												<ul className='max-h-60 h-40 overflow-y-auto text-sm mb-2'>
													{timesheet.slice().reverse().map((entry, index) => (
														<li key={index} className="text-gray-800">
															{entry.type === 'in' && (
																<div className='bg-neutral-950 text-white p-1 rounded-md'>
																	<span className="font-bold">In:</span> {new Date(entry.timestamp).toLocaleString()}
																</div>
															)}
															{entry.type === 'out' && (
																<div className="p-1">
																	<span className="font-bold">Out:</span> {new Date(entry.timestamp).toLocaleString()}
																</div>
															)}
														</li>
													))}
												</ul>
											</>}
										</div>
									</div>
								</div>
								<div className="mx-auto w-full justify-center flex flex-row items-center self-center md:ml-2 gap-3 mt-4">
									{isTimerRunning ? (
										<button
											className="px-4 py-2 sm:text-xl text-gray-800 border border-gray-800 bg-red-400 rounded-lg shadow-md hover:bg-red-600 font-bold"
											onClick={handleStopTimer}
										>
											Clock Out
										</button>
									) : (
										<button
											className="px-4 py-2 sm:text-xl text-gray-800 bg-green-400 rounded-lg shadow-md hover:bg-green-600 font-bold border border-gray-800"
											onClick={handleStartTimer}
										>
											Clock In
										</button>
									)}
									<p className="text-neutral-300 sm:text-xl p-2 bg-gray-800 rounded-lg border border-green-400">
										<b>Session:</b>{' '}
										<span className="text-green-600">
											{formatTime(sessionHours, sessionMinutes, sessionSeconds)}
										</span>
									</p>
								</div>
							</div>
						</>
					) : (
						<p className="text-center text-red-600 text-xl font-semibold">
							Project not found
						</p>
					)}
				</div>
			</div>
			<Footer />
		</>
	)
}

export default ProjectDetails
