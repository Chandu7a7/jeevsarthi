import { useState, useEffect } from 'react';
import { farmerAPI } from '../../services/api';
import { toast } from 'react-hot-toast';
import { QrCode, Search, Loader2 } from 'lucide-react';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

const AnimalSelector = ({ selectedAnimal, onAnimalSelect, onQRScan }) => {
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAnimals();
  }, []);

  const fetchAnimals = async () => {
    try {
      setLoading(true);
      const response = await farmerAPI.getAnimals();
      // API returns { success: true, data: animals[] }
      const animalsData = response.data?.data || response.data || [];
      setAnimals(Array.isArray(animalsData) ? animalsData : []);
    } catch (error) {
      toast.error('Failed to load animals');
      console.error('Error fetching animals:', error);
      setAnimals([]);
    } finally {
      setLoading(false);
    }
  };

  const handleQRScan = async () => {
    try {
      // For now, we'll use a prompt. In production, use a QR scanner library
      const scannedValue = prompt('Enter or scan Pashu Aadhaar ID:');
      if (!scannedValue) return;

      // Find animal from local list by Pashu Aadhaar ID
      const animal = animals.find(
        (a) => a.pashuAadhaarId?.toUpperCase() === scannedValue.toUpperCase()
      );
      
      if (animal) {
        onAnimalSelect(animal);
        toast.success('Animal loaded from QR scan');
      } else {
        toast.error('Animal not found. Please check the QR code.');
      }
    } catch (error) {
      toast.error('Error scanning QR code.');
    }
  };

  const filteredAnimals = Array.isArray(animals) ? animals.filter((animal) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      animal.animalName?.toLowerCase().includes(search) ||
      animal.pashuAadhaarId?.toLowerCase().includes(search) ||
      animal.species?.toLowerCase().includes(search)
    );
  }) : [];

  return (
    <div className="space-y-2">
      <Label htmlFor="animal-select">Select Animal *</Label>
      <div className="flex gap-2">
        <Select
          value={selectedAnimal?._id || ''}
          onValueChange={(value) => {
            const animal = animals.find((a) => a._id === value);
            if (animal) onAnimalSelect(animal);
          }}
        >
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Select an animal" />
          </SelectTrigger>
          <SelectContent>
            {loading ? (
              <div className="p-4 text-center">
                <Loader2 className="w-4 h-4 animate-spin mx-auto" />
              </div>
            ) : filteredAnimals.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No animals found
              </div>
            ) : (
              filteredAnimals.map((animal) => (
                <SelectItem key={animal._id} value={animal._id}>
                  {animal.animalName || 'Unnamed'} - {animal.pashuAadhaarId} (
                  {animal.species})
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
        <button
          type="button"
          onClick={handleQRScan}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <QrCode className="w-4 h-4" />
          Scan QR
        </button>
      </div>

      {/* Search input for filtering */}
      {Array.isArray(animals) && animals.length > 5 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search animals..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      )}

      {/* Selected Animal Info */}
      {selectedAnimal && (
        <Card className="p-3 bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-800">
                {selectedAnimal.animalName || 'Unnamed Animal'}
              </p>
              <p className="text-sm text-gray-600">
                {selectedAnimal.pashuAadhaarId} • {selectedAnimal.species}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default AnimalSelector;

