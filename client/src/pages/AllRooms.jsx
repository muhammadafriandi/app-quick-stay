import React, { useState, useMemo } from 'react'
import { assets, facilityIcons } from '../assets/assets'
import { useSearchParams } from 'react-router-dom'
import StarRating from '../components/StarRating'
import { useAppContext } from '../context/AppContext'

const CheckBox = ({ label, selected = false, onChange = () => { } }) => {
  return (
    <label className='flex gap-3 items-center cursor-pointer mt-2 text-sm'>
      <input
        type="checkbox"
        checked={selected}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className='font-light select-none'>{label}</span>
    </label>
  )
}

const RadioButton = ({ label, selected = false, onChange = () => { } }) => {
  return (
    <label className='flex gap-3 items-center cursor-pointer mt-2 text-sm'>
      <input
        type="radio"
        name="sortOption"
        checked={selected}
        onChange={() => onChange(label)}
      />
      <span className='font-light select-none'>{label}</span>
    </label>
  )
}

const AllRooms = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const { navigate, rooms, currency } = useAppContext()

  const [openFilters, setOpenFilters] = useState(false)

  const [selectedFilters, setSelectedFilters] = useState({
    roomTypes: [],
    priceRanges: [],
  })

  const [selectedSort, setSelectedSort] = useState('')

  const roomTypes = [
    'single Bed',
    'Double Bed',
    'Luxury Room',
    'Family Suite',
  ]

  const priceRanges = [
    '0 to 50',
    '500 to 1000',
    '1000 to 2000',
    '2000 to 3000',
  ]

  const sortOptions = [
    'Price Low to High',
    'Price High to Low',
    'Newest First',
  ]

  // Handle checkbox filters
  const handleFilterChange = (checked, value, type) => {
    setSelectedFilters((prevFilters) => ({
      ...prevFilters,
      [type]: checked
        ? [...prevFilters[type], value]
        : prevFilters[type].filter((item) => item !== value),
    }))
  }

  // Handle sorting
  const handleSortChange = (option) => {
    setSelectedSort(option)
  }

  // Check room type
  const matchesRoomType = (room) => {
    return (
      selectedFilters.roomTypes.length === 0 ||
      selectedFilters.roomTypes.includes(room.roomType)
    )
  }

  // Check price range
  const matchesPriceRange = (room) => {
    return (
      selectedFilters.priceRanges.length === 0 ||
      selectedFilters.priceRanges.some((range) => {
        const [min, max] = range.split('to').map(Number)

        return (
          room.pricePerNight >= min &&
          room.pricePerNight <= max
        )
      })
    )
  }

  // Sort rooms
  const sortRooms = (a, b) => {
    if (selectedSort === 'Price Low to High') {
      return a.pricePerNight - b.pricePerNight
    }

    if (selectedSort === 'Price High to Low') {
      return b.pricePerNight - a.pricePerNight
    }

    if (selectedSort === 'Newest First') {
      return new Date(b.createdAt) - new Date(a.createdAt)
    }

    return 0
  }

  // Filter by destination
  const filterDestination = (room) => {
    const destination = searchParams.get('destination')

    if (!destination) return true

    return room.hotel.city
      .toLowerCase()
      .includes(destination.toLowerCase())
  }

  // Filter and sort rooms
  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => matchesRoomType(room) && matchesPriceRange(room) && filterDestination(room)).sort(sortRooms)
  }, [rooms, selectedFilters, selectedSort, searchParams])

  // Clear all filters
  const clearFilter = () => {
    setSelectedFilters({
      roomTypes: [],
      priceRanges: [],
    })

    setSelectedSort('')
    setSearchParams({})
  }

  return (
    <div className='flex flex-col-reverse lg:flex-row items-start justify-between pt-28 md:pt-35 md:px-16 lg:px-24 xl:px-32'>

      {/* Rooms */}
      <div>
        <div className='flex flex-col items-start text-left'>
          <h1 className='font-playfair text-4xl md:text-[40px]'>
            All Rooms
          </h1>

          <p className='text-sm md:text-base text-gray-500/90 mt-2 max-w-174'>
            Take advantage of our limited-time offers and special package
            to enhance your stay and create unforgettable memories.
          </p>
        </div>

        {filteredRooms.map((room) => (
          <div
            key={room._id}
            className='flex flex-col md:flex-row items-start py-10 gap-6 border-b border-gray-300 last:pb-30 last:border-0'
          >
            <img
              onClick={() => {
                navigate(`/rooms/${room._id}`)
                scrollTo(0, 0)
              }}
              src={room.images[0]}
              alt="hotel-image"
              title="View Room Details"
              className='max-h-65 md:w-1/2 rounded-xl shadow-lg object-cover cursor-pointer'
            />

            <div className='md:w-1/2 flex flex-col gap-2'>
              <p className='text-gray-500'>
                {room.hotel.city}
              </p>

              <p
                onClick={() => {
                  navigate(`/rooms/${room._id}`)
                  scrollTo(0, 0)
                }}
                className='text-gray-800 text-3xl font-playfair cursor-pointer'
              >
                {room.hotel.name}
              </p>

              <div className='flex items-center'>
                <StarRating />
                <p className='ml-2'>200+ reviews</p>
              </div>

              <div className='flex items-center gap-1 text-gray-500 mt-2 text-sm'>
                <img
                  src={assets.locationIcon}
                  alt="location-icon"
                />
                <span>{room.hotel.address}</span>
              </div>

              {/* Room Amenities */}
              <div className='flex flex-wrap items-center mt-3 mb-6 gap-4'>
                {room.amenities.map((item, index) => (
                  <div
                    key={index}
                    className='flex items-center gap-2 px-3 py-2 rounded-lg bg-[#F5F5FF]/70'
                  >
                    <img
                      src={facilityIcons[item]}
                      alt={item}
                      className='w-5 h-5'
                    />
                    <p className='text-xs'>{item}</p>
                  </div>
                ))}
              </div>

              {/* Room Price */}
              <p className='text-xl font-medium text-gray-700'>
                ${room.pricePerNight} /night
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className='bg-white w-80 border border-gray-300 text-gray-600 max-lg:mb-8 min-lg:mt-16'>

        <div
          className={`flex items-center justify-between px-5 py-2.5 min-lg:border-b border-gray-300 ${openFilters && 'border-b'
            }`}
        >
          <p className='text-base font-medium text-gray-800'>
            Filters
          </p>

          <div className='text-xs cursor-pointer'>
            <span
              onClick={() => setOpenFilters(!openFilters)}
              className='lg:hidden'
            >
              {openFilters ? 'Hide' : 'Show'}
            </span>

            <span
              onClick={clearFilter}
              className='hidden lg:block'
            >
              Clear
            </span>
          </div>
        </div>

        <div
          className={`${openFilters ? 'h-auto' : 'h-0 lg:h-auto'
            } overflow-hidden transition-all duration-700`}
        >

          {/* Room Types */}
          <div className='px-5 pt-5'>
            <p className='font-medium text-gray-800 pb-2'>
              Popular filters
            </p>

            {roomTypes.map((type, index) => (
              <CheckBox
                key={index}
                label={type}
                selected={selectedFilters.roomTypes.includes(type)}
                onChange={(checked) =>
                  handleFilterChange(
                    checked,
                    type,
                    'roomTypes'
                  )
                }
              />
            ))}
          </div>

          {/* Price Range */}
          <div className='px-5 pt-5'>
            <p className='font-medium text-gray-800 pb-2'>
              Price Range
            </p>

            {priceRanges.map((range, index) => (
              <CheckBox
                key={index}
                label={`${currency} ${range}`}
                selected={selectedFilters.priceRanges.includes(range)}
                onChange={(checked) =>
                  handleFilterChange(
                    checked,
                    range,
                    'priceRanges'
                  )
                }
              />
            ))}
          </div>

          {/* Sort */}
          <div className='px-5 pt-5'>
            <p className='font-medium text-gray-800 pb-2'>
              Sort By
            </p>

            {sortOptions.map((option, index) => (
              <RadioButton
                key={index}
                label={option}
                selected={selectedSort === option}
                onChange={handleSortChange}
              />
            ))}
          </div>

        </div>
      </div>
    </div>
  )
}

export default AllRooms
