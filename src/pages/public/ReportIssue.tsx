import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Upload, X, MapPin, Navigation, AlertCircle, CheckCircle, ArrowRight, ArrowLeft, Layers, Shield, Sparkles } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { CivicMap } from '../../components/common/LeafletMap';
import { PriorityBadge } from '../../components/common/Badge';
import { api, calculateDistanceMeters } from '../../lib/api';
import { CategoryId, Ticket } from '../../types';

export const ReportIssue: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  // Multi-step state
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form fields state
  const [descLang, setDescLang] = useState<'en' | 'ur' | 'roman-ur'>('en');
  const [category, setCategory] = useState<CategoryId>('streetlight');
  const [description, setDescription] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string>('/images/issue-streetlight-night.jpg');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('/images/issue-streetlight-night.jpg');
  const [photoError, setPhotoError] = useState<string>('');

  // Location state (Karachi default: Gulshan-e-Iqbal)
  const [position, setPosition] = useState<[number, number]>([24.9192, 67.0984]);
  const [areaName, setAreaName] = useState('Gulshan-e-Iqbal, Block 4');
  const [locationSearch, setLocationSearch] = useState('');
  const [locPermissionError, setLocPermissionError] = useState('');
  const [nearbyTickets, setNearbyTickets] = useState<Ticket[]>([]);
  const [clusterWithId, setClusterWithId] = useState<number | undefined>(undefined);

  // Review step state
  const [anonymous, setAnonymous] = useState(false);
  const [contact, setContact] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation errors
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Field refs for focus on error
  const descRef = useRef<HTMLTextAreaElement>(null);
  const categoryRef = useRef<HTMLSelectElement>(null);

  // Check nearby tickets whenever location or category changes
  useEffect(() => {
    api.nearby(position[0], position[1], category).then((results) => {
      setNearbyTickets(results);
    });
  }, [position, category]);

  // Adjust photo preview if user switches category initially and hasn't uploaded a file
  useEffect(() => {
    if (!photoFile) {
      const categoryPhotoDefaults: Record<CategoryId, string> = {
        streetlight: '/images/issue-streetlight-night.jpg',
        road_damage: '/images/issue-pothole.jpg',
        garbage: '/images/issue-garbage.jpg',
        water_leak: '/images/issue-water-leak.jpg',
        blocked_drain: '/images/issue-drain-blocked.jpg'
      };
      setPhotoUrl(categoryPhotoDefaults[category]);
      setPhotoPreview(categoryPhotoDefaults[category]);
    }
  }, [category, photoFile]);

  // Handle Photo File selection with 5MB validation
  const handlePhotoUpload = (file: File) => {
    setPhotoError('');
    if (file.size > 5 * 1024 * 1024) {
      setPhotoError(t('report.errors.photoTooLarge'));
      return;
    }
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setPhotoPreview(result);
      setPhotoUrl(result);
    };
    reader.readAsDataURL(file);
  };

  // Step 1 Validation
  const validateStep1 = () => {
    const errs: { [key: string]: string } = {};
    if (!category) errs.category = t('report.errors.categoryRequired');
    if (!description.trim() || description.trim().length < 10) {
      errs.description = t('report.errors.descTooShort');
    } else if (description.trim().length > 1000) {
      errs.description = t('report.errors.descTooLong');
    }
    if (!photoUrl) errs.photo = t('report.errors.photoRequired');

    setErrors(errs);
    if (errs.category && categoryRef.current) categoryRef.current.focus();
    else if (errs.description && descRef.current) descRef.current.focus();

    return Object.keys(errs).length === 0;
  };

  const handleNextFromStep1 = () => {
    if (validateStep1()) {
      setStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNextFromStep2 = () => {
    setStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUseMyLocation = () => {
    setLocPermissionError('');
    if (!navigator.geolocation) {
      setLocPermissionError(t('report.location.locPermissionDenied'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition([pos.coords.latitude, pos.coords.longitude]);
        setAreaName('User GPS Location');
      },
      () => {
        setLocPermissionError(t('report.location.locPermissionDenied'));
      },
      { timeout: 8000 }
    );
  };

  const handleSearchLocation = (e: React.FormEvent) => {
    e.preventDefault();
    const q = locationSearch.toLowerCase();
    const karachiPlaces: Record<string, { pos: [number, number]; area: string }> = {
      gulshan: { pos: [24.9192, 67.0984], area: 'Gulshan-e-Iqbal, Karachi' },
      dha: { pos: [24.8142, 67.0678], area: 'DHA Phase 5, Karachi' },
      defence: { pos: [24.8142, 67.0678], area: 'DHA Phase 5, Karachi' },
      pechs: { pos: [24.8720, 67.0605], area: 'PECHS Block 2, Karachi' },
      nazimabad: { pos: [24.9355, 67.0430], area: 'North Nazimabad, Karachi' },
      korangi: { pos: [24.8390, 67.1215], area: 'Korangi Sector 15, Karachi' },
      clifton: { pos: [24.8220, 67.0330], area: 'Clifton Block 4, Karachi' },
      saddar: { pos: [24.8585, 67.0285], area: 'Saddar, Karachi' }
    };

    for (const key of Object.keys(karachiPlaces)) {
      if (q.includes(key)) {
        setPosition(karachiPlaces[key].pos);
        setAreaName(karachiPlaces[key].area);
        return;
      }
    }
    // Default search fallback
    setAreaName(`${locationSearch}, Karachi`);
  };

  // Submit Complaint
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const ticket = await api.createComplaint({
        category,
        text: description,
        language: descLang,
        lat: position[0],
        lng: position[1],
        area: areaName,
        photoUrl,
        anonymous,
        contact: contact.trim() || undefined,
        clusterWithId
      });
      // Redirect to Confirmation screen (Screen 3)
      navigate(`/report/done/${ticket.code}`, {
        state: { ticket, mergedWithCluster: !!clusterWithId }
      });
    } catch (e) {
      console.error(e);
      alert('Failed to submit complaint. Please retry.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-[800px] mx-auto px-4 sm:px-6 py-4 sm:py-8 space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#14231F]">
          {t('report.title')}
        </h1>
        <p className="text-sm text-[#6B7C77] mt-1">
          {t('report.subtitle')}
        </p>
      </div>

      {/* 3-Step Stepper Navigation */}
      <div className="bg-white rounded-xl p-3 sm:p-4 border border-[#E3EAE7] shadow-civic-sm flex items-center justify-between">
        {[
          { num: 1, label: t('report.steps.details') },
          { num: 2, label: t('report.steps.location') },
          { num: 3, label: t('report.steps.review') }
        ].map((s, idx) => (
          <React.Fragment key={s.num}>
            <button
              onClick={() => {
                if (s.num < step) setStep(s.num as any);
                else if (s.num === 2 && step === 1 && validateStep1()) setStep(2);
              }}
              className={`flex items-center gap-2 text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                step === s.num
                  ? 'text-[#1E8E6E]'
                  : step > s.num
                  ? 'text-[#14231F] hover:text-[#1E8E6E]'
                  : 'text-[#6B7C77]/60 cursor-not-allowed'
              }`}
            >
              <span
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  step === s.num
                    ? 'bg-[#1E8E6E] text-white'
                    : step > s.num
                    ? 'bg-[#E6F4EF] text-[#1E8E6E]'
                    : 'bg-[#F5F8F7] text-[#6B7C77] border border-[#E3EAE7]'
                }`}
              >
                {step > s.num ? '✓' : s.num}
              </span>
              <span className="hidden sm:inline">{s.label}</span>
            </button>
            {idx < 2 && (
              <div
                className={`flex-1 h-0.5 mx-2 sm:mx-4 ${
                  step > s.num ? 'bg-[#1E8E6E]' : 'bg-[#E3EAE7]'
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* STEP 1: Details (Screen 2 Step 1) */}
      {step === 1 && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E3EAE7] shadow-civic-card space-y-6">
          {/* Issue Type Select */}
          <div>
            <label className="block text-sm font-semibold text-[#14231F] mb-1.5 font-control">
              {t('report.categoryLabel')} <span className="text-red-500">*</span>
            </label>
            <select
              ref={categoryRef}
              value={category}
              onChange={(e) => setCategory(e.target.value as CategoryId)}
              className="w-full min-h-[44px] px-3.5 py-2.5 rounded-lg border border-[#E3EAE7] bg-white text-sm text-[#14231F] focus:outline-none focus:ring-2 focus:ring-[#1E8E6E] font-control"
            >
              <option value="streetlight">{t('categories.streetlight')}</option>
              <option value="road_damage">{t('categories.road_damage')}</option>
              <option value="garbage">{t('categories.garbage')}</option>
              <option value="water_leak">{t('categories.water_leak')}</option>
              <option value="blocked_drain">{t('categories.blocked_drain')}</option>
            </select>
            {errors.category && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errors.category}</span>
              </p>
            )}
          </div>

          {/* Description with Language Tabs */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-semibold text-[#14231F] font-control">
                {t('report.descLabel')} <span className="text-red-500">*</span>
              </label>

              {/* Language Tabs for Description input hint */}
              <div className="flex items-center gap-1 p-0.5 rounded-lg bg-[#F5F8F7] border border-[#E3EAE7] text-xs font-medium">
                {(['en', 'ur', 'roman-ur'] as const).map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setDescLang(l)}
                    className={`px-2.5 py-1 rounded-md transition-colors font-control ${
                      descLang === l
                        ? 'bg-white text-[#1E8E6E] font-bold shadow-sm'
                        : 'text-[#6B7C77] hover:text-[#14231F]'
                    }`}
                  >
                    {t(`report.langHint.${l}`)}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              ref={descRef}
              rows={4}
              value={description}
              dir={descLang === 'ur' ? 'rtl' : 'ltr'}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t(`report.langHintText.${descLang}`)}
              className={`w-full p-3.5 rounded-lg border border-[#E3EAE7] text-sm text-[#14231F] focus:outline-none focus:ring-2 focus:ring-[#1E8E6E] leading-relaxed ${
                descLang === 'ur' ? 'font-nastaliq-text' : ''
              }`}
            />
            <div className="flex items-center justify-between text-xs text-[#6B7C77] mt-1">
              <span>
                {errors.description ? (
                  <span className="text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.description}
                  </span>
                ) : (
                  'Minimum 10 characters required'
                )}
              </span>
              <span className="font-mono">{description.length} / 1000</span>
            </div>
          </div>

          {/* Photo Upload with Drag & Drop */}
          <div>
            <label className="block text-sm font-semibold text-[#14231F] mb-1.5 font-control">
              {t('report.photoLabel')} <span className="text-red-500">*</span>
            </label>

            {photoPreview ? (
              <div className="relative rounded-xl overflow-hidden border border-[#E3EAE7] aspect-video max-w-md mx-auto group">
                <img
                  src={photoPreview}
                  alt="Complaint photo preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setPhotoFile(null);
                    setPhotoPreview('');
                    setPhotoUrl('');
                  }}
                  className="absolute top-3 end-3 p-2 rounded-lg bg-black/70 text-white hover:bg-black transition-colors"
                  aria-label={t('report.photoRemove')}
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-2 start-2 px-2.5 py-1 rounded bg-black/60 text-white text-xs font-medium">
                  {photoFile ? photoFile.name : 'Default Category Evidence Photo'}
                </div>
              </div>
            ) : (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files?.[0]) {
                    handlePhotoUpload(e.dataTransfer.files[0]);
                  }
                }}
                className="border-2 border-dashed border-[#E3EAE7] hover:border-[#1E8E6E] rounded-xl p-8 text-center transition-colors bg-[#F5F8F7]/50 cursor-pointer"
                onClick={() => {
                  const input = document.getElementById('photo-input');
                  input?.click();
                }}
              >
                <Upload className="w-8 h-8 mx-auto text-[#1E8E6E] mb-2" />
                <p className="text-sm font-medium text-[#14231F]">
                  {t('report.photoDropzone')}
                </p>
                <p className="text-xs text-[#6B7C77] mt-1">
                  {t('report.photoHelp')}
                </p>
                <input
                  id="photo-input"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      handlePhotoUpload(e.target.files[0]);
                    }
                  }}
                />
              </div>
            )}

            {photoError && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{photoError}</span>
              </p>
            )}
          </div>

          {/* Step 1 Actions */}
          <div className="pt-4 flex justify-end border-t border-[#E3EAE7]">
            <Button
              onClick={handleNextFromStep1}
              size="lg"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              {t('report.review.next')}
            </Button>
          </div>
        </div>
      )}

      {/* STEP 2: Location & Live 50m Nearby Panel (Screen 2 Step 2) */}
      {step === 2 && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E3EAE7] shadow-civic-card space-y-6">
          <div>
            <h2 className="text-lg font-bold text-[#14231F]">
              {t('report.steps.location')}
            </h2>
            <p className="text-xs text-[#6B7C77] mt-0.5">
              {t('report.location.pinInstruction')}
            </p>
          </div>

          {/* Search bar & Use My Location button */}
          <div className="flex flex-col sm:flex-row gap-3">
            <form onSubmit={handleSearchLocation} className="flex-1 flex gap-2">
              <input
                type="text"
                value={locationSearch}
                onChange={(e) => setLocationSearch(e.target.value)}
                placeholder={t('report.location.searchPlaceholder')}
                className="flex-1 min-h-[44px] px-3.5 py-2 rounded-lg border border-[#E3EAE7] text-sm text-[#14231F] focus:outline-none focus:ring-2 focus:ring-[#1E8E6E]"
              />
              <Button type="submit" variant="secondary">
                Search
              </Button>
            </form>

            <Button
              type="button"
              variant="secondary"
              leftIcon={<Navigation className="w-4 h-4 text-[#1E8E6E]" />}
              onClick={handleUseMyLocation}
            >
              {t('report.location.useMyLocation')}
            </Button>
          </div>

          {locPermissionError && (
            <div className="p-3 rounded-lg bg-[#FBE6E6] text-[#D64545] text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{locPermissionError}</span>
            </div>
          )}

          {/* Interactive Leaflet Map with Draggable Pin */}
          <CivicMap
            center={position}
            zoom={15}
            draggablePin={true}
            onPositionChange={(newPos) => {
              setPosition(newPos);
              setAreaName(`GPS: ${newPos[0].toFixed(4)}, ${newPos[1].toFixed(4)}`);
            }}
          />

          <div className="p-3 rounded-lg bg-[#F5F8F7] border border-[#E3EAE7] flex flex-wrap items-center justify-between text-xs text-[#6B7C77]">
            <span className="flex items-center gap-1.5 font-medium text-[#14231F]">
              <MapPin className="w-3.5 h-3.5 text-[#1E8E6E]" />
              {areaName}
            </span>
            <span className="font-mono isolate-ltr">
              {position[0].toFixed(5)}, {position[1].toFixed(5)}
            </span>
          </div>

          {/* Live "Already Reported Nearby" Panel (~50m duplicate check) */}
          <div className="p-4 sm:p-5 rounded-xl border border-[#E3EAE7] bg-[#F5F8F7]/60 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#FDEBD8] text-[#E8731A] flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#14231F]">
                  {t('report.location.nearbyAlertTitle')}
                </h4>
                <p className="text-xs text-[#6B7C77]">
                  {t('report.location.nearbyAlertDesc')}
                </p>
              </div>
            </div>

            {nearbyTickets.length > 0 ? (
              <div className="space-y-2 pt-1">
                {nearbyTickets.map((ticket) => {
                  const dist = calculateDistanceMeters(position[0], position[1], ticket.lat, ticket.lng);
                  const isSelected = clusterWithId === ticket.id;
                  return (
                    <div
                      key={ticket.id}
                      className={`p-3 rounded-lg border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-[#E6F4EF] border-[#1E8E6E] ring-1 ring-[#1E8E6E]'
                          : 'bg-white border-[#E3EAE7]'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-[#14231F]">
                            {ticket.code}
                          </span>
                          <PriorityBadge priority={ticket.priorityLabel} />
                          <span className="text-[11px] text-[#6B7C77]">
                            ~{dist}m away
                          </span>
                        </div>
                        <p className="text-xs text-[#6B7C77] line-clamp-1">
                          {ticket.text}
                        </p>
                      </div>

                      <div className="shrink-0">
                        {isSelected ? (
                          <button
                            type="button"
                            onClick={() => setClusterWithId(undefined)}
                            className="px-3 py-1.5 rounded-lg bg-[#1E8E6E] text-white text-xs font-semibold"
                          >
                            ✓ Joined Cluster
                          </button>
                        ) : (
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            onClick={() => setClusterWithId(ticket.id)}
                          >
                            {t('report.location.addToExisting')}
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-[#6B7C77] italic">
                {t('report.location.noNearby')}
              </p>
            )}
          </div>

          {/* Step 2 Actions */}
          <div className="pt-4 flex items-center justify-between border-t border-[#E3EAE7]">
            <Button
              variant="secondary"
              onClick={() => setStep(1)}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              {t('report.review.back')}
            </Button>
            <Button
              onClick={handleNextFromStep2}
              size="lg"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              {t('report.review.next')}
            </Button>
          </div>
        </div>
      )}

      {/* STEP 3: Review & Submit (Screen 2 Step 3) */}
      {step === 3 && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E3EAE7] shadow-civic-card space-y-6">
          <div>
            <h2 className="text-lg font-bold text-[#14231F]">
              {t('report.review.heading')}
            </h2>
            <p className="text-xs text-[#6B7C77] mt-0.5">
              {t('report.review.subheading')}
            </p>
          </div>

          {/* Summary Card */}
          <div className="p-4 rounded-xl border border-[#E3EAE7] bg-[#F5F8F7]/60 space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-24 h-24 rounded-lg overflow-hidden border border-[#E3EAE7] shrink-0">
                <img
                  src={photoPreview}
                  alt="Review upload preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-1.5 flex-1 min-w-0">
                <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#E6F4EF] text-[#1E8E6E]">
                  {t(`categories.${category}`)}
                </span>
                <p className="text-sm text-[#14231F] font-medium leading-snug">
                  {description}
                </p>
                <div className="text-xs text-[#6B7C77] flex items-center gap-1 pt-1">
                  <MapPin className="w-3.5 h-3.5 text-[#1E8E6E]" />
                  <span>{areaName}</span>
                </div>
              </div>
            </div>

            {clusterWithId && (
              <div className="p-2.5 rounded-lg bg-[#E6F4EF] text-[#166F57] text-xs font-medium flex items-center gap-2">
                <Sparkles className="w-4 h-4 shrink-0 text-[#1E8E6E]" />
                <span>
                  Joining existing spatial cluster ticket #{clusterWithId}. Duplicate will be merged.
                </span>
              </div>
            )}
          </div>

          {/* Anonymous Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-xl border border-[#E3EAE7]">
            <div>
              <span className="text-sm font-semibold text-[#14231F] block">
                {t('report.review.anonymousLabel')}
              </span>
              <span className="text-xs text-[#6B7C77] block">
                {t('report.review.anonymousHelp')}
              </span>
            </div>
            <input
              type="checkbox"
              checked={anonymous}
              onChange={(e) => setAnonymous(e.target.checked)}
              className="w-5 h-5 accent-[#1E8E6E] rounded cursor-pointer"
            />
          </div>

          {/* Optional Contact Input */}
          {!anonymous && (
            <div>
              <label className="block text-sm font-semibold text-[#14231F] mb-1.5 font-control">
                {t('report.review.contactLabel')}
              </label>
              <input
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder={t('report.review.contactPlaceholder')}
                className="w-full min-h-[44px] px-3.5 py-2.5 rounded-lg border border-[#E3EAE7] text-sm text-[#14231F] focus:outline-none focus:ring-2 focus:ring-[#1E8E6E]"
              />
            </div>
          )}

          <p className="text-xs text-[#6B7C77] italic">
            {t('report.review.terms')}
          </p>

          {/* Sticky Bottom Action Bar on Mobile / Standard Desktop */}
          <div className="pt-4 flex items-center justify-between border-t border-[#E3EAE7]">
            <Button
              variant="secondary"
              onClick={() => setStep(2)}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              {t('report.review.back')}
            </Button>
            <Button
              onClick={handleSubmit}
              size="lg"
              isLoading={isSubmitting}
            >
              {isSubmitting ? t('report.review.submitting') : t('report.review.submitBtn')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
