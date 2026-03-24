'use client'

import { useState, useEffect } from 'react'
import { useProfileStore } from '@/stores/useProfileStore'
import { computeAccuracyPct } from '@/lib/bio-accuracy'
import { AccuracyRing } from './AccuracyRing'
import type { BioMetricRecord } from '@/lib/db/profile'
import type { BioMetricEntryId } from '@/types'

export function BioForm() {
  const { latestBio, loadLatestBio, saveBio } = useProfileStore()
  const [heightCm, setHeightCm] = useState('')
  const [weightKg, setWeightKg] = useState('')
  const [ageYears, setAgeYears] = useState('')
  const [gender, setGender] = useState<'male' | 'female' | null>(null)
  const [bodyFatPct, setBodyFatPct] = useState('')
  const [measurementsCm, setMeasurementsCm] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    loadLatestBio()
  }, [loadLatestBio])

  useEffect(() => {
    if (latestBio) {
      setHeightCm(latestBio.heightCm != null ? String(latestBio.heightCm) : '')
      setWeightKg(latestBio.weightKg != null ? String(latestBio.weightKg) : '')
      setAgeYears(latestBio.ageYears != null ? String(latestBio.ageYears) : '')
      setGender(latestBio.gender)
      setBodyFatPct(latestBio.bodyFatPct != null ? String(latestBio.bodyFatPct) : '')
      setMeasurementsCm(latestBio.measurementsCm != null ? String(latestBio.measurementsCm) : '')
    }
  }, [latestBio])

  const pseudoRecord: BioMetricRecord = {
    id: '' as BioMetricEntryId,
    recordedAt: 0,
    heightCm: heightCm !== '' ? Number(heightCm) : null,
    weightKg: weightKg !== '' ? Number(weightKg) : null,
    ageYears: ageYears !== '' ? Number(ageYears) : null,
    gender,
    bodyFatPct: bodyFatPct !== '' ? Number(bodyFatPct) : null,
    measurementsCm: measurementsCm !== '' ? Number(measurementsCm) : null,
  }
  const accuracyPct = computeAccuracyPct(pseudoRecord)

  const handleSave = async () => {
    const record: BioMetricRecord = {
      id: crypto.randomUUID() as BioMetricEntryId,
      recordedAt: Date.now(),
      heightCm: heightCm !== '' ? Number(heightCm) : null,
      weightKg: weightKg !== '' ? Number(weightKg) : null,
      ageYears: ageYears !== '' ? Number(ageYears) : null,
      gender,
      bodyFatPct: bodyFatPct !== '' ? Number(bodyFatPct) : null,
      measurementsCm: measurementsCm !== '' ? Number(measurementsCm) : null,
    }
    await saveBio(record)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-4">
        <AccuracyRing pct={accuracyPct} />
        <div>
          <p className="text-[14px] text-muted-foreground">Profile Accuracy</p>
          <p className="text-[12px] text-muted-foreground">Fill in more fields to improve accuracy</p>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="height-cm" className="text-[14px] text-muted-foreground mb-1 block">Height (cm)</label>
        <input
          id="height-cm"
          type="number"
          min="100"
          max="250"
          step="1"
          value={heightCm}
          onChange={e => setHeightCm(e.target.value)}
          className="w-full h-10 px-3 rounded-lg bg-muted text-foreground text-[16px] border border-border outline-none focus:ring-2 focus:ring-primary"
          aria-label="Height (cm)"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="weight-kg" className="text-[14px] text-muted-foreground mb-1 block">Weight (kg)</label>
        <input
          id="weight-kg"
          type="number"
          min="30"
          max="300"
          step="0.1"
          value={weightKg}
          onChange={e => setWeightKg(e.target.value)}
          className="w-full h-10 px-3 rounded-lg bg-muted text-foreground text-[16px] border border-border outline-none focus:ring-2 focus:ring-primary"
          aria-label="Weight (kg)"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="age-years" className="text-[14px] text-muted-foreground mb-1 block">Age</label>
        <input
          id="age-years"
          type="number"
          min="13"
          max="100"
          step="1"
          value={ageYears}
          onChange={e => setAgeYears(e.target.value)}
          className="w-full h-10 px-3 rounded-lg bg-muted text-foreground text-[16px] border border-border outline-none focus:ring-2 focus:ring-primary"
          aria-label="Age"
        />
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-[14px] text-muted-foreground mb-1 block">Gender</span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setGender(gender === 'male' ? null : 'male')}
            className={gender === 'male'
              ? 'flex-1 h-10 rounded-lg text-[16px] font-medium bg-primary text-primary-foreground'
              : 'flex-1 h-10 rounded-lg text-[16px] font-medium bg-card text-muted-foreground border border-border'
            }
          >
            Male
          </button>
          <button
            type="button"
            onClick={() => setGender(gender === 'female' ? null : 'female')}
            className={gender === 'female'
              ? 'flex-1 h-10 rounded-lg text-[16px] font-medium bg-primary text-primary-foreground'
              : 'flex-1 h-10 rounded-lg text-[16px] font-medium bg-card text-muted-foreground border border-border'
            }
          >
            Female
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="body-fat-pct" className="text-[14px] text-muted-foreground mb-1 block">Body Fat (%)</label>
        <input
          id="body-fat-pct"
          type="number"
          min="3"
          max="60"
          step="0.1"
          value={bodyFatPct}
          onChange={e => setBodyFatPct(e.target.value)}
          className="w-full h-10 px-3 rounded-lg bg-muted text-foreground text-[16px] border border-border outline-none focus:ring-2 focus:ring-primary"
          aria-label="Body Fat (%)"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="waist-cm" className="text-[14px] text-muted-foreground mb-1 block">Waist (cm)</label>
        <input
          id="waist-cm"
          type="number"
          min="40"
          max="200"
          step="0.1"
          value={measurementsCm}
          onChange={e => setMeasurementsCm(e.target.value)}
          className="w-full h-10 px-3 rounded-lg bg-muted text-foreground text-[16px] border border-border outline-none focus:ring-2 focus:ring-primary"
          aria-label="Waist (cm)"
        />
      </div>

      <button
        type="button"
        onClick={handleSave}
        className="w-full h-12 bg-primary text-primary-foreground rounded-lg font-medium text-[16px] mt-4"
      >
        {saved ? 'Saved!' : 'Save Profile'}
      </button>
    </div>
  )
}
