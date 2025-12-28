import React, { useState } from 'react';
import { AlertCircle, Trash2, DollarSign } from 'lucide-react';
import ProjectsPageAvatarUpload from './ProjectsPageAvatarUpload';
import PortfolioConnectionToggle from './PortfolioConnectionToggle';

interface ImprovedAddProviderFormProps {
  onCreate: (provider: any, kind: 'talent' | 'team' | 'agency') => void;
  isLoading?: boolean;
  category?: string;
  providerType?: 'talent' | 'team' | 'agency';
}

interface Service {
  name: string;
  price: string;
}

export default function ImprovedAddProviderForm({
  onCreate,
  isLoading = false,
  category = 'digital-marketing',
  providerType = 'talent',
}: ImprovedAddProviderFormProps) {
  const kind = providerType;
  const [name, setName] = useState('');
  const [titleOrType, setTitleOrType] = useState('');
  const [workLocation, setWorkLocation] = useState('remote');
  const [optionalLocation, setOptionalLocation] = useState('');
  const [startingRate, setStartingRate] = useState('');
  const [teamSize, setTeamSize] = useState('');
  const [description, setDescription] = useState('');
  const [services, setServices] = useState<Service[]>([]);
  const [serviceInput, setServiceInput] = useState('');
  const [servicePrice, setServicePrice] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [portfolioConnected, setPortfolioConnected] = useState(false);


  const handlePortfolioToggle = (connected: boolean, profileData?: { name: string; avatar_url: string | null }) => {
    setPortfolioConnected(connected);

    if (connected && profileData) {
      setName(profileData.name || '');
      if (profileData.avatar_url) {
        setAvatarPreview(profileData.avatar_url);
      }
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!name.trim()) errors.name = 'Name is required';
    if (!titleOrType.trim()) {
      errors.titleOrType = kind === 'talent' ? 'Title is required' : 'Type/Role is required';
    }
    if (!description.trim()) errors.description = 'Description is required';
    if (services.length === 0) errors.services = 'Add at least one service with pricing';

    // Validate services have prices
    const invalidServices = services.filter(s => !s.price || Number(s.price) <= 0);
    if (invalidServices.length > 0) {
      errors.services = 'All services must have a valid price';
    }

    if (kind !== 'talent') {
      if (!startingRate || Number(startingRate) < 0) {
        errors.startingRate = 'Valid starting rate is required';
      }
      if (!teamSize || Number(teamSize) <= 0) {
        errors.teamSize = 'Valid team size is required';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddService = () => {
    const trimmedName = serviceInput.trim();
    const trimmedPrice = servicePrice.trim();

    if (!trimmedName) {
      setValidationErrors({ ...validationErrors, services: 'Service name is required' });
      return;
    }

    if (!trimmedPrice || Number(trimmedPrice) <= 0) {
      setValidationErrors({ ...validationErrors, services: 'Valid price is required' });
      return;
    }

    if (services.some(s => s.name.toLowerCase() === trimmedName.toLowerCase()) && services.length < 10) {
      setValidationErrors({ ...validationErrors, services: 'This service is already added' });
      return;
    }

    if (services.length < 10) {
      setServices([...services, { name: trimmedName, price: trimmedPrice }]);
      setServiceInput('');
      setServicePrice('');
      setValidationErrors({ ...validationErrors, services: '' });
    }
  };

  const handleRemoveService = (index: number) => {
    setServices(services.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;

    const provider: any = {
      name: name.trim(),
      title_or_type: titleOrType.trim(),
      work_location: workLocation,
      optional_location: optionalLocation.trim() || null,
      description: description.trim(),
      avatar_file: avatarFile,
      services,
      category,
      provider_type: kind,
      status: 'draft',
      portfolio_connected: portfolioConnected,
    };

    if (kind !== 'talent') {
      provider.starting_rate = Number(startingRate);
      provider.team_size = Number(teamSize);
    }

    try {
      await onCreate(provider, kind);
      // Reset form
      setName('');
      setTitleOrType('');
      setWorkLocation('remote');
      setOptionalLocation('');
      setStartingRate('');
      setTeamSize('');
      setDescription('');
      setServices([]);
      setServiceInput('');
      setServicePrice('');
      setAvatarFile(null);
      setAvatarPreview(null);
      setPortfolioConnected(false);
      setValidationErrors({});
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create profile');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {/* Portfolio Connection Toggle */}
      <PortfolioConnectionToggle
        isConnected={portfolioConnected}
        onToggle={handlePortfolioToggle}
        providerType={kind}
      />

      {/* Avatar Upload */}
      <ProjectsPageAvatarUpload
        onFileSelect={(file, preview) => {
          setAvatarFile(file);
          setAvatarPreview(preview);
        }}
        initialPreview={avatarPreview}
        providerType={kind}
        disabled={portfolioConnected}
      />

      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {kind === 'talent' ? 'Full Name' : 'Business Name'}
          {portfolioConnected && <span className="text-rose-400 text-xs ml-2">(from Portfolio)</span>}
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (validationErrors.name) {
              setValidationErrors({ ...validationErrors, name: '' });
            }
          }}
          disabled={portfolioConnected}
          placeholder={kind === 'talent' ? 'John Doe' : 'Creative Studios'}
          className={`w-full px-4 py-3 glass-effect rounded-xl border text-white bg-transparent focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
            validationErrors.name ? 'border-red-500/50' : 'border-white/20'
          }`}
        />
        {validationErrors.name && (
          <p className="mt-1 text-xs text-red-400">{validationErrors.name}</p>
        )}
      </div>

      {/* Title/Type */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {kind === 'talent' ? 'Professional Title' : 'Business Type/Role'}
        </label>
        <input
          type="text"
          value={titleOrType}
          onChange={(e) => {
            setTitleOrType(e.target.value);
            if (validationErrors.titleOrType) {
              setValidationErrors({ ...validationErrors, titleOrType: '' });
            }
          }}
          placeholder={kind === 'talent' ? 'e.g., Digital Marketer' : 'e.g., Production House'}
          className={`w-full px-4 py-3 glass-effect rounded-xl border text-white bg-transparent focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-all ${
            validationErrors.titleOrType ? 'border-red-500/50' : 'border-white/20'
          }`}
        />
        {validationErrors.titleOrType && (
          <p className="mt-1 text-xs text-red-400">{validationErrors.titleOrType}</p>
        )}
      </div>

      {/* Work Location */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Work Location</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(['remote', 'on-site', 'hybrid', 'flexible'] as const).map((loc) => (
            <button
              key={loc}
              type="button"
              onClick={() => setWorkLocation(loc)}
              className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                workLocation === loc
                  ? 'bg-gradient-to-r from-rose-500 to-purple-600 text-white'
                  : 'glass-effect text-gray-300 hover:text-white border border-white/10'
              }`}
            >
              {loc.charAt(0).toUpperCase() + loc.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Optional Location */}
      {(workLocation === 'on-site' || workLocation === 'hybrid') && (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
          <input
            type="text"
            value={optionalLocation}
            onChange={(e) => setOptionalLocation(e.target.value)}
            placeholder="e.g., Kampala, Uganda"
            className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 text-white bg-transparent focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-all"
          />
        </div>
      )}

      {/* Starting Rate & Team Size (for teams and agencies only) */}
      {kind !== 'talent' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Starting Rate (UGX)
            </label>
            <input
              type="number"
              value={startingRate}
              onChange={(e) => {
                setStartingRate(e.target.value);
                if (validationErrors.startingRate) {
                  setValidationErrors({ ...validationErrors, startingRate: '' });
                }
              }}
              onWheel={(e) => e.currentTarget.blur()}
              placeholder="e.g., 500000"
              className={`w-full px-4 py-3 glass-effect rounded-xl border text-white bg-transparent focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-all ${
                validationErrors.startingRate ? 'border-red-500/50' : 'border-white/20'
              }`}
            />
            {validationErrors.startingRate && (
              <p className="mt-1 text-xs text-red-400">{validationErrors.startingRate}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Team Size</label>
            <input
              type="number"
              value={teamSize}
              onChange={(e) => {
                setTeamSize(e.target.value);
                if (validationErrors.teamSize) {
                  setValidationErrors({ ...validationErrors, teamSize: '' });
                }
              }}
              onWheel={(e) => e.currentTarget.blur()}
              placeholder="e.g., 5"
              className={`w-full px-4 py-3 glass-effect rounded-xl border text-white bg-transparent focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-all ${
                validationErrors.teamSize ? 'border-red-500/50' : 'border-white/20'
              }`}
            />
            {validationErrors.teamSize && (
              <p className="mt-1 text-xs text-red-400">{validationErrors.teamSize}</p>
            )}
          </div>
        </div>
      )}

      {/* Services with Pricing */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Services/Specialties
        </label>
        <div className="space-y-3 mb-3">
          <input
            type="text"
            value={serviceInput}
            onChange={(e) => setServiceInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddService();
              }
            }}
            placeholder="e.g., Brand Strategy"
            className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 text-white bg-transparent focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-all"
          />
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              <input
                type="number"
                value={servicePrice}
                onChange={(e) => setServicePrice(e.target.value)}
                onWheel={(e) => e.currentTarget.blur()}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddService();
                  }
                }}
                placeholder="Price (UGX)"
                className="w-full pl-10 pr-4 py-3 glass-effect rounded-xl border border-white/20 text-white bg-transparent focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-all"
              />
            </div>
            <button
              type="button"
              onClick={handleAddService}
              disabled={!serviceInput.trim() || !servicePrice.trim() || services.length >= 10}
              className="px-6 py-3 bg-gradient-to-r from-rose-500 to-purple-600 text-white rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
            >
              Add
            </button>
          </div>
        </div>

        {services.length > 0 && (
          <div className="space-y-2">
            {services.map((service, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-rose-500/10 border border-rose-400/30 rounded-lg"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{service.name}</p>
                  <p className="text-xs text-rose-300">UGX {Number(service.price).toLocaleString()}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveService(index)}
                  className="text-rose-400 hover:text-rose-300 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {validationErrors.services && (
          <p className="mt-2 text-xs text-red-400">{validationErrors.services}</p>
        )}
        <p className="mt-2 text-xs text-gray-400">{services.length} / 10 services added</p>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
        <textarea
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            if (validationErrors.description) {
              setValidationErrors({ ...validationErrors, description: '' });
            }
          }}
          placeholder="Tell potential clients about your experience, expertise, and what makes you special..."
          className={`w-full px-4 py-3 glass-effect rounded-xl border text-white bg-transparent focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-all resize-none h-32 ${
            validationErrors.description ? 'border-red-500/50' : 'border-white/20'
          }`}
        />
        {validationErrors.description && (
          <p className="mt-1 text-xs text-red-400">{validationErrors.description}</p>
        )}
        <p className="mt-1 text-xs text-gray-400">{description.length} / 500 characters</p>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => {
            setName('');
            setTitleOrType('');
            setWorkLocation('remote');
            setOptionalLocation('');
            setStartingRate('');
            setTeamSize('');
            setDescription('');
            setServices([]);
            setServiceInput('');
            setServicePrice('');
            setAvatarFile(null);
            setAvatarPreview(null);
            setPortfolioConnected(false);
            setValidationErrors({});
          }}
          className="px-6 py-3 glass-effect text-gray-300 hover:text-white rounded-xl border border-white/10 transition-colors font-medium"
        >
          Clear
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-8 py-3 bg-gradient-to-r from-rose-500 to-purple-600 text-white rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
        >
          {isLoading ? 'Creating...' : 'Create Profile'}
        </button>
      </div>
    </form>
  );
}
