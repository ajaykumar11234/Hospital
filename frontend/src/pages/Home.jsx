import React from 'react'
import Header from '../components/Header'
import SpevialityMenu from '../components/SpecialityMenu'
import TopDoctors from '../components/TopDoctors'
import Banner from '../components/Banner'
import Footer from '../components/Footer'
// import SymptomChecker from '../components/SymptomChecker'
// import HealthChatbot from '../components/HealthChatbot'
// import Diagnosis from '../components/Diagnosis'
// import Chatbot from '../components/Chatbot'
const Home = () => {
  return (
    
    <div>
    {/* <SymptomChecker/> */}
    {/* <HealthChatbot/> */}
    {/* <Diagnosis/> */}
    {/* <Chatbot/> */}
      <Header />
      <SpevialityMenu />
      <TopDoctors />
      <Banner/>
      <Footer/>
    </div>
  )
}

export default Home
