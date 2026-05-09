import p1 from '../assets/Products/p-1.jpg'
import p2 from '../assets/Products/p-2.jpg'
import p3 from '../assets/Products/p-3.jpg'
import p4 from '../assets/Products/p-4.jpg'
import p5 from '../assets/Products/p-5.jpg'
import p7 from '../assets/Products/p-7.jpg'
import p9 from '../assets/Products/p-9.jpg'
import headphone from '../assets/Hero/headphone.png'
import macbook from '../assets/Hero/macbook.png'
import vr from '../assets/Hero/vr.png'
import earphone from '../assets/Category/earphone.png'
import gaming from '../assets/Category/gaming.png'
import speaker from '../assets/Category/speaker.png'
import smartwatch2 from '../assets/Category/smartwatch2.png'
import watch from '../assets/Category/watch.png'

export const CATEGORIES = [
  'Todos',
  'Auriculares',
  'Laptops',
  'Smartwatch',
  'Gaming',
  'Parlantes',
  'Teléfonos',
]

export const ProductsData = [
  {
    id: 1,
    title: 'Auricular JBL Pro',
    price: 120,
    discount: 0,
    category: 'Auriculares',
    images: [p1, p3, p4, p5, p7],
    aosDelay: '0',
  },
  {
    id: 2,
    title: 'Auricular Sanyo Bass',
    price: 420,
    discount: 20,
    category: 'Auriculares',
    images: [p3, p1, p4, p5, p7],
    aosDelay: '100',
  },
  {
    id: 3,
    title: 'Auricular Red Sound',
    price: 320,
    discount: 0,
    category: 'Auriculares',
    images: [p4, p3, p1, p5, p7],
    aosDelay: '200',
  },
  {
    id: 4,
    title: 'Auricular JS Studio',
    price: 220,
    discount: 15,
    category: 'Auriculares',
    images: [p5, p1, p3, p4, p7],
    aosDelay: '300',
  },
  {
    id: 5,
    title: 'MacBook Air M2',
    price: 1500,
    discount: 0,
    category: 'Laptops',
    images: [macbook, p2, p7, p9, p1],
    aosDelay: '0',
  },
  {
    id: 6,
    title: 'Notebook Samsung Ultra',
    price: 1200,
    discount: 20,
    category: 'Laptops',
    images: [p9, macbook, p2, p7, p3],
    aosDelay: '100',
  },
  {
    id: 7,
    title: 'Smartwatch Premium',
    price: 350,
    discount: 30,
    category: 'Smartwatch',
    images: [smartwatch2, watch, p7, p9, p1],
    aosDelay: '200',
  },
  {
    id: 8,
    title: 'Smartwatch Lite',
    price: 199,
    discount: 0,
    category: 'Smartwatch',
    images: [watch, smartwatch2, p2, p7, p9],
    aosDelay: '300',
  },
  {
    id: 9,
    title: 'Headset VR Gaming',
    price: 890,
    discount: 10,
    category: 'Gaming',
    images: [vr, headphone, p1, p2, p9],
    aosDelay: '0',
  },
  {
    id: 10,
    title: 'Auricular Gaming Pro',
    price: 250,
    discount: 25,
    category: 'Gaming',
    images: [gaming, p4, p5, p7, p9],
    aosDelay: '100',
  },
  {
    id: 11,
    title: 'Parlante Bass 360',
    price: 180,
    discount: 0,
    category: 'Parlantes',
    images: [speaker, p2, p7, p9, p3],
    aosDelay: '200',
  },
  {
    id: 12,
    title: 'Auricular Sony WH',
    price: 280,
    discount: 0,
    category: 'Auriculares',
    images: [p7, p1, p3, p4, p5],
    aosDelay: '300',
  },
  {
    id: 13,
    title: 'Headphone Studio',
    price: 195,
    discount: 35,
    category: 'Auriculares',
    images: [headphone, earphone, p1, p3, p7],
    aosDelay: '0',
  },
  {
    id: 14,
    title: 'Earphone Inalámbrico',
    price: 89,
    discount: 0,
    category: 'Auriculares',
    images: [earphone, headphone, p1, p3, p5],
    aosDelay: '100',
  },
  {
    id: 15,
    title: 'Parlante Portátil',
    price: 120,
    discount: 15,
    category: 'Parlantes',
    images: [p2, speaker, p7, p9, p3],
    aosDelay: '200',
  },
  {
    id: 16,
    title: 'Teléfono Android 5G',
    price: 699,
    discount: 0,
    category: 'Teléfonos',
    images: [p9, p2, p7, p1, p3],
    aosDelay: '300',
  },
]
