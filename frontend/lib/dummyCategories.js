import { Car, Smartphone, Home, Monitor, Bike, Briefcase } from 'lucide-react';

export const categories = [
  { id: '1', name: 'Mobiles', icon: Smartphone, color: 'text-blue-500' },
  { id: '2', name: 'Vehicles', icon: Car, color: 'text-red-500' },
  { id: '4', name: 'Real Estate', icon: Home, color: 'text-green-500' },
  { id: '5', name: 'Electronics & Appliances', icon: Monitor, color: 'text-purple-500' },
  { id: '6', name: 'Bikes', icon: Bike, color: 'text-orange-500' },
  { id: '7', name: 'Jobs', icon: Briefcase, color: 'text-teal-500' },
];

export const subcategories = {
  '1': [
    { id: '101', name: 'Mobile Phones' },
    { id: '102', name: 'Accessories' },
    { id: '103', name: 'Tablets' }
  ],
  '2': [
    { id: '201', name: 'Cars' },
    { id: '202', name: 'Commercial Vehicles' },
    { id: '203', name: 'Spare Parts' }
  ],
  '4': [
    { id: '401', name: 'For Sale: Houses & Apartments' },
    { id: '402', name: 'For Rent: Houses & Apartments' },
    { id: '403', name: 'Lands & Plots' }
  ],
  '5': [
    { id: '501', name: 'TVs, Video - Audio' },
    { id: '502', name: 'Kitchen & Other Appliances' },
    { id: '503', name: 'Computers & Laptops' }
  ],
  '6': [
    { id: '601', name: 'Motorcycles' },
    { id: '602', name: 'Scooters' },
    { id: '603', name: 'Bicycles' }
  ],
  '7': [
    { id: '701', name: 'IT' },
    { id: '702', name: 'Sales & Marketing' },
    { id: '703', name: 'BPO & Telecaller' }
  ]
};

// Generic dynamic fields we might get from an admin panel per subcategory
export const dummyDynamicFieldsOptions = {
  '101': [
    { id: 'brand', label: 'Brand', type: 'select', options: ['Apple', 'Samsung', 'OnePlus', 'Google', 'Other'], required: true },
    { id: 'condition', label: 'Condition', type: 'radio', options: ['New', 'Used - Like New', 'Used - Fair'], required: true },
  ],
  '201': [
    { id: 'brand', label: 'Make', type: 'select', options: ['Toyota', 'Honda', 'Ford', 'BMW', 'Other'], required: true },
    { id: 'year', label: 'Year', type: 'number', required: true },
    { id: 'fuel', label: 'Fuel Type', type: 'radio', options: ['Petrol', 'Diesel', 'Electric', 'Hybrid'], required: true },
    { id: 'transmission', label: 'Transmission', type: 'radio', options: ['Manual', 'Automatic'], required: true },
    { id: 'kmDriven', label: 'KM Driven', type: 'number', required: true }
  ],
  'default': [
    { id: 'condition', label: 'Condition', type: 'radio', options: ['New', 'Used'], required: true }
  ]
};
