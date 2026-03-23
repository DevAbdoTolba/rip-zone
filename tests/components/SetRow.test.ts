import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { createElement } from 'react'
import { SetRow } from '@/components/workout/SetRow'

describe('SetRow', () => {
  it('renders with defaultReps and defaultWeightKg values', () => {
    render(
      createElement(SetRow, {
        setNumber: 1,
        defaultReps: 10,
        defaultWeightKg: 60,
        isPR: false,
        confirmed: false,
        onConfirm: vi.fn(),
      })
    )

    // NumberField inputs should show default values
    const repsInput = screen.getByLabelText('Reps')
    const weightInput = screen.getByLabelText('Weight in kg')

    expect(repsInput).toBeDefined()
    expect(weightInput).toBeDefined()
    expect((repsInput as HTMLInputElement).value).toBe('10')
    expect((weightInput as HTMLInputElement).value).toBe('60')
  })

  it('calls onConfirm with reps and weightKg when confirm button is clicked', () => {
    const onConfirm = vi.fn()
    render(
      createElement(SetRow, {
        setNumber: 1,
        defaultReps: 10,
        defaultWeightKg: 60,
        isPR: false,
        confirmed: false,
        onConfirm,
      })
    )

    const confirmButton = screen.getByRole('button', { name: /confirm set/i })
    fireEvent.click(confirmButton)

    expect(onConfirm).toHaveBeenCalledWith(10, 60)
  })

  it('shows PRBadge when isPR is true', () => {
    render(
      createElement(SetRow, {
        setNumber: 1,
        defaultReps: 10,
        defaultWeightKg: 60,
        isPR: true,
        confirmed: false,
        onConfirm: vi.fn(),
      })
    )

    expect(screen.getByText('PR')).toBeDefined()
  })

  it('hides PRBadge when isPR is false', () => {
    render(
      createElement(SetRow, {
        setNumber: 1,
        defaultReps: 10,
        defaultWeightKg: 60,
        isPR: false,
        confirmed: false,
        onConfirm: vi.fn(),
      })
    )

    expect(screen.queryByText('PR')).toBeNull()
  })
})
