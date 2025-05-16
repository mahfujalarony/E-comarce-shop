import React from 'react'
import Navbar from './Navbar'
import Fetch from './Fetch'
import BrowseCategory from './BrowsCatagory'
import BestSelling from './BestSelling'
import Explore from './Explore'

const Main: React.FC = () => {
  return (
    <div>
      <Navbar />
      <Fetch />
      <BrowseCategory />
      <BestSelling />
      <Explore />
    </div>
  )
}

export default Main
