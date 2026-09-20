import React, { useEffect, useState } from "react"
import Title from "../../components/Title"
import { assets } from "../../assets/assets"
import toast from "react-hot-toast"
import { useAppContext } from "../../context/AppContext"

const AddRoom = () => {
  const { axios, getToken } = useAppContext()

  const [images, setImages] = useState({
    1: null,
    2: null,
    3: null,
    4: null,
  })

  const [inputs, setInputs] = useState({
    roomType: "",
    pricePerNight: "",
    amenities: {
      "Free Wifi": false,
      "Free Breakfast": false,
      "Room Service": false,
      "Mountain View": false,
      "Pool Access": false,
    },
  })

  const [loading, setLoading] = useState(false)

  useEffect(() => {
    return () => {
      Object.values(images).forEach((image) => {
        if (image) {
          URL.revokeObjectURL(URL.createObjectURL(image))
        }
      })
    }
  }, [images])

  const handleImageChange = (key, file) => {
    if (!file) return

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB")
      return
    }

    setImages((prev) => ({
      ...prev,
      [key]: file,
    }))
  }

  const removeImage = (key) => {
    setImages((prev) => ({
      ...prev,
      [key]: null,
    }))
  }

  const resetForm = () => {
    setInputs({
      roomType: "",
      pricePerNight: "",
      amenities: {
        "Free Wifi": false,
        "Free Breakfast": false,
        "Room Service": false,
        "Mountain View": false,
        "Pool Access": false,
      },
    })

    setImages({
      1: null,
      2: null,
      3: null,
      4: null,
    })
  }

  const onSubmitHandler = async (e) => {
    e.preventDefault()

    if (!inputs.roomType) {
      toast.error("Please select a room type")
      return
    }

    if (
      !inputs.pricePerNight ||
      Number(inputs.pricePerNight) <= 0
    ) {
      toast.error("Please enter a valid price")
      return
    }

    const selectedAmenities = Object.keys(inputs.amenities).filter(
      (key) => inputs.amenities[key]
    )

    if (selectedAmenities.length === 0) {
      toast.error("Please select at least one amenity")
      return
    }

    const selectedImages = Object.values(images).filter(
      (image) => image !== null
    )

    if (selectedImages.length === 0) {
      toast.error("Please upload at least one room image")
      return
    }

    setLoading(true)

    try {
      const formData = new FormData()

      formData.append("roomType", inputs.roomType)

      formData.append("pricePerNight", String(inputs.pricePerNight))

      formData.append("amenities", JSON.stringify(selectedAmenities))

      selectedImages.forEach((image) => {
        formData.append("images", image)
      })

      const token = await getToken()

      if (!token) {
        toast.error("Authentication token not available")
        return
      }


      const { data } = await axios.post(
        "/api/rooms",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (data.success) {
        toast.success(data.message)

        resetForm()
      } else {
        toast.error(
          data.message || "Failed to create room"
        )
      }
    } catch (error) {
      console.error("Add room error:", error)

      toast.error(
        error.response?.data?.message ||
        error.message ||
        "Something went wrong"
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmitHandler}>
      <Title
        align="left"
        font="outfit"
        title="Add Room"
        subTitle="Fill in the details carefully and accurately to enhance the user booking experience."
      />

      <p className="text-gray-800 mt-10">
        Images
      </p>

      <div className="grid grid-cols-2 sm:flex gap-4 my-2 flex-wrap">
        {Object.keys(images).map((key) => (
          <div
            key={key}
            className="relative"
          >
            <label
              htmlFor={`roomImage${key}`}
              className="cursor-pointer"
            >
              <img
                src={
                  images[key]
                    ? URL.createObjectURL(images[key])
                    : assets.uploadArea
                }
                alt={`Room ${key}`}
                className="w-32 h-24 object-cover rounded border border-gray-200 opacity-90 hover:opacity-100"
              />
            </label>

            <input
              type="file"
              accept="image/*"
              id={`roomImage${key}`}
              onChange={(e) =>
                handleImageChange(
                  key,
                  e.target.files?.[0]
                )
              }
              hidden
            />

            {images[key] && (
              <button
                type="button"
                onClick={() => removeImage(key)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs"
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>

      {/* =====================================================
          ROOM TYPE + PRICE
      ====================================================== */}
      <div className="w-full flex max-sm:flex-col sm:gap-4 mt-4">
        {/* Room Type */}
        <div className="flex-1 max-w-48">
          <p className="text-gray-800 mt-4">
            Room Type
          </p>

          <select
            value={inputs.roomType}
            onChange={(e) =>
              setInputs((prev) => ({
                ...prev,
                roomType: e.target.value,
              }))
            }
            className="border border-gray-300 mt-1 rounded p-2 w-full"
          >
            <option value="">
              Select Room Type
            </option>

            <option value="Single Bed">
              Single Bed
            </option>

            <option value="Double Bed">
              Double Bed
            </option>

            <option value="Luxury Room">
              Luxury Room
            </option>

            <option value="Family Suite">
              Family Suite
            </option>
          </select>
        </div>

        {/* Price */}
        <div>
          <p className="mt-4 text-gray-800">
            Price{" "}
            <span className="text-xs">
              /night
            </span>
          </p>

          <input
            type="number"
            min="0"
            placeholder="0"
            className="border border-gray-300 mt-1 rounded p-2 w-32"
            value={inputs.pricePerNight}
            onChange={(e) =>
              setInputs((prev) => ({
                ...prev,
                pricePerNight:
                  e.target.value,
              }))
            }
          />
        </div>
      </div>

      <p className="text-gray-800 mt-6">
        Amenities
      </p>

      <div className="flex flex-col gap-2 mt-2 text-gray-600 max-w-sm">
        {Object.keys(inputs.amenities).map(
          (amenity, index) => (
            <div
              key={amenity}
              className="flex items-center gap-2"
            >
              <input
                type="checkbox"
                id={`amenity-${index}`}
                checked={
                  inputs.amenities[amenity]
                }
                onChange={() =>
                  setInputs((prev) => ({
                    ...prev,
                    amenities: {
                      ...prev.amenities,
                      [amenity]:
                        !prev.amenities[
                        amenity
                        ],
                    },
                  }))
                }
              />

              <label
                htmlFor={`amenity-${index}`}
                className="cursor-pointer"
              >
                {amenity}
              </label>
            </div>
          )
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`bg-primary text-white px-8 py-2 rounded mt-8 ${loading
          ? "opacity-50 cursor-not-allowed"
          : "cursor-pointer"
          }`}
      >
        {loading
          ? "Adding..."
          : "Add Room"}
      </button>
    </form>
  )
}

export default AddRoom
