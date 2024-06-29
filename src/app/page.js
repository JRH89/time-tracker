// pages/index.js
import Image from 'next/image'
import Link from 'next/link'

export default function Home() {
  return (
    <div>
      <HeroSection />
      <MainSection />
      <CallToAction />
    </div>
  )
}

function HeroSection() {
  return (
    <div className="bg-sky-800 min-h-screen flex flex-col justify-center items-center text-white py-20">
      <div className="container mx-auto px-6 md:px-12 text-center">
        <Image
          className='mx-auto rounded-2xl mb-4'
          width={100}
          height={100}
          src={"/favicon.ico"}
        />
        <h1 className="text-4xl md:text-5xl font-bold mb-6">Project and Time Management for Freelancers</h1>
        <p className="text-lg md:text-xl mb-8">Track your projects, manage tasks, log hours, and boost your productivity with our all-in-one solution.</p>
        <Link href="/dashboard" className="bg-white text-sky-800 px-6 py-3 rounded-md text-lg font-semibold hover:bg-gray-200">Sign Up Now</Link>
      </div>
    </div>
  )
}

function MainSection() {
  return (
    <div className="py-20 bg-gray-800">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-3xl font-bold mb-6">Secure Accounts Ensure Privacy</h2>
            <p className="text-lg mb-6">Log in with your email and password. No need to share your login details with anyone.</p>
            <Image src="/6.png" alt="Secure Accounts" width={600} height={400} className="rounded-lg" />
          </div>
          <div>
            <h2 className="text-3xl font-bold mb-6">Add New Projects and Tasks</h2>
            <p className="text-lg mb-6">Start managing your projects and tasks with our intuitive interface. Create new projects, add tasks, and track time spent.</p>
            <Image src="/3.png" alt="Add Projects and Tasks" width={600} height={400} className="rounded-lg" />
          </div>
          <div>
            <h2 className="text-3xl font-bold mb-6">Boost Your Productivity</h2>
            <p className="text-lg mb-6">Clock in and clock out feature to log hours with precision. Perfect for payroll and productivity management for freelancers.</p>
            <Image src="/4.png" alt="Boost Productivity" width={600} height={400} className="rounded-lg" />
          </div>
          <div>
            <h2 className="text-3xl font-bold mb-6">Manage Your Projects Efficiently</h2>
            <p className="text-lg mb-6">Our tool helps you keep track of the cost of projects and time spent on them. Keep track of todos and log hours with timestamps.</p>
            <Image src="/5.png" alt="Project Management" width={600} height={400} className="rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  )
}

function CallToAction() {
  return (
    <div id="signup" className="bg-sky-800 text-white pt-20">
      <div className="container mx-auto px-6 md:px-12 text-center pb-20">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Get Started?</h2>
        <p className="text-lg md:text-xl mb-6">Sign up now and start managing your projects more efficiently!</p>
        <Link href="/dashboard" className="bg-white text-sky-800 px-6 py-3 rounded-md text-lg font-semibold hover:bg-gray-200">Sign Up or Sign In</Link>
      </div>
      <footer data-testid='footer' className="bg-neutral-50 border-t border-gray-800 flex-row p-4 self-center text-sky-800 xl:text-lg w-full flex justify-center items-center text-center">
        <div className="flex flex-col pt-4 w-full justify-center items-center">
          <div className="flex flex-col font-medium text-lg sm:text-xl bg-neutral-50 gap-2 rounded-t-lg px-2 sm:px-5 self-center text-sky-800 md:text-2xl w-full justify-between text-center">
          </div>
          <div className="flex justify-center mb-4 ml-2 pt-6 space-x-4">
            <a data-testid="linkedin" href="https://blog.hookerhillstudios.com/" target="_blank" rel="noopener noreferrer" className="text-4xl hover:text-emerald-600 hover:scale-110 duration-300 px-2">
              <i className="fa fa-newspaper w-full text-center flex"></i>
            </a>
            <a href="https://play.google.com/store/apps/dev?id=4957396816342892948&hl=en_US" target="_blank" rel="noopener noreferrer" className="text-4xl hover:text-emerald-600 hover:scale-110 duration-300 px-2">
              <i className="fa-brands fa-google-play"></i>
            </a>
            <a data-testid="youtube" href="https://www.youtube.com/@hookerhillstudios" target="_blank" rel="noopener noreferrer" className="text-4xl hover:text-emerald-600 hover:scale-110 duration-300 px-2">
              <i className="fab fa-youtube w-full text-center flex"></i>
            </a>
          </div>
          <div className="mt-4 text-sm sm:text-base text-gray-600">
            <p>&copy; 2024 Hooker Hill Studios. All rights reserved.</p>
            <p>Los Angeles, California | <a href="mailto:hookerhillstudios@gmail.com" className="hover:text-emerald-600 duration-300">hookerhillstudios@gmail.com</a></p>
          </div>
        </div>
      </footer>
    </div>
  )
}
