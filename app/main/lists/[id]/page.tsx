// app/main/hotel/page.tsx
'use client';
export const dynamic = 'force-dynamic'

import { useState } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { differenceInDays } from 'date-fns';
import {
  ChevronLeft,
  ChevronRight,
  MapPin
} from 'lucide-react';

import { useSearchStore } from '@/store/SearchStore';

import Navbar from '@/components/navbar/Navbar';
import Header from '@/components/header/Header';
import MailList from '@/components/mailList/MailList';
import Footer from '@/components/footer/Footer';
import Loader from '@/components/loader/loader';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useFetch } from '@/utils/hooks/useFetch';
import { DatePickerRange } from '@/components/DatePicker';
import { DateRange } from 'react-day-picker';
import GuestSelector from '@/components/GuestSelector';

// Types for Hotel and Room
interface Hotel {
  _id: string;
  name: string;
  address: string;
  distance: string;
  photos: string[];
  title: string;
  desc: string;
  cheapestPrice: number;
}

export default function HotelPage() {
  const params = useParams();
  const router = useRouter();
  const hotelId = params.id as string;

  // State for image slider
  const [slideNumber, setSlideNumber] = useState(0);
  const [isImageOpen, setIsImageOpen] = useState(false);

  // Get search context
  const { dates, options, setDates, setOptions } = useSearchStore();
  // Fetch hotel details
  const {
    data: hotel,
    isLoading
  } = useFetch(`/api/routes/hotels/getHotel?hotelId=${hotelId}`, 
    {
      enabled:!!hotelId
    }) as {
    data: Hotel;
    isLoading: boolean;
  };

  // Calculate days and total price
  const days = dates?.length > 0
    ? differenceInDays(
      dates[0].to! || new Date().toISOString(),
      dates[0].from! || new Date().toISOString()
    )
    : 0;

  // Image slider handlers
  const handleOpenImage = (index: number) => {
    setSlideNumber(index);
    setIsImageOpen(true);
  };

  const handleMoveSlide = (direction: 'l' | 'r') => {
    const totalPhotos = hotel?.photos.length || 6;
    setSlideNumber(prev =>
      direction === 'l'
        ? (prev === 0 ? totalPhotos - 1 : prev - 1)
        : (prev === totalPhotos - 1 ? 0 : prev + 1)
    );
  };

  // Portfolio-safe reservation action
  const handleReserve = () => {
    if (days === 0) {
      toast.error('No date selected', { description: 'Please choose a date!' });
      return;
    }
    toast.success('Reservation flow demonstrated', {
      description: 'The production booking and payment backend is intentionally private.'
    });
  };

  const handleAnotherHotel = () => {

    // Create URLSearchParams with search data
    const searchParams = new URLSearchParams({
      dates: JSON.stringify(dates[0]),
      adults: options.adults.toString(),
      children: options.children.toString(),
      rooms: options.rooms.toString()
    });
    router.push(`/main/hotels?${searchParams.toString()}`);
  };


  const handleGuestChange = (type: 'adults' | 'children' | 'rooms', operation: 'increase' | 'decrease') => {
    setOptions({
      ...options,
      [type]: operation === 'increase'
        ? options[type] + 1
        : Math.max(type === 'adults' ? 1 : 0, options[type] - 1)
    })
  }


  if (isLoading) return <Loader />;
  //if (!hotel) return <div>Hotel not found</div>;



  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Header type="list" />

      {/* Image Slider Dialog */}
      <Dialog open={isImageOpen} onOpenChange={setIsImageOpen}>
        <DialogHeader className='' >
          <DialogTitle className='sr-only'>Hotel Images</DialogTitle>
        </DialogHeader>
        <DialogContent className="max-w-4xl" >
          <div className="relative w-full h-[70vh]">
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 z-10"
              onClick={() => handleMoveSlide('l')}
            >
              <ChevronLeft className="h-10 w-10" />
            </Button>

            <Image
              src={hotel?.photos[slideNumber]!}
              alt="Hotel Image"
              fill
              className="object-contain"
            />

            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 z-10"
              onClick={() => handleMoveSlide('r')}
            >
              <ChevronRight className="h-10 w-10" />
            </Button>


          </div>
        </DialogContent>
      </Dialog>

      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div>

            {/* Hotel Images */}
            <div className="grid grid-cols-3 gap-4">
              {hotel?.photos.slice(0, 6).map((photo, index) => (
                <div
                  key={index}
                  className="relative h-40 cursor-pointer"
                  onClick={() => handleOpenImage(index)}
                >
                  <Image
                    src={photo}
                    alt={`Hotel view ${index + 1}`}
                    fill
                    className="object-cover rounded-lg hover:opacity-80 transition"
                  />
                </div>
              ))}
            </div>
            {/* Hotel Description */}
            <div className="mt-8">
              <h2 className="text-2xl font-bold mb-4">Description</h2>
              <p className="text-gray-700">{hotel?.desc}</p>
              <p className="text-gray-500 text-sm mt-2">Come with your family and enjoy our hotel!</p>
            </div>

            <div className="mt-6" >
                  <label className="block mb-2">Modify Search</label>
                  <div className='flex items-center gap-2'>
                    <DatePickerRange
                      dates={dates[0]}
                      onChange={(item) => setDates([item as DateRange])}
                      minDate={new Date()}
                    // ranges={searchParams.dates}
                    />
                    <GuestSelector guests={options} onGuestChange={(key, value) => handleGuestChange(key, value)} />
                  </div>
                </div>
          </div>

          {/* Hotel Details */}
          <div>
            <h1 className="text-3xl font-bold mb-4">{hotel?.name}</h1>

            <div className="flex items-center mb-2">
              <MapPin className="mr-2 text-gray-600" />
              <span>{hotel?.address}</span>
            </div>

            <p className="text-gray-600 mb-4">
              Excellent location – {hotel?.distance}m from center
            </p>

            <p className="text-green-600 font-semibold mb-4">
              Book a stay over ${hotel?.cheapestPrice} and get a free airport taxi
            </p>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h2 className="text-xl font-semibold">
                Perfect for a {days}-night stay!
              </h2>
              <p className="text-gray-600 mt-2">
                Located in the heart of the city, this property has an
                excellent location score of 9.8!
              </p>

              <div className="mt-4">
                <p className="text-2xl font-bold">
                  ${days * hotel?.cheapestPrice! * (options?.rooms || 1)}
                  <span className="text-sm font-normal ml-2">
                    ({days} nights)
                  </span>
                </p>


                <Button
                  className="mt-4 bg-primary text-primary-white hover:bg-primary-light w-full"
                  onClick={handleReserve}
                >
                  Reserve or Book Now!
                </Button>
                <Button
                  className="mt-4 w-full"
                  variant="outline"
                  onClick={handleAnotherHotel}
                >
                  Choose another hotel
                </Button>
              </div>
            </div>
          </div>
        </div>


      </div>

      <MailList />
      <Footer />
    </div>
  );
}