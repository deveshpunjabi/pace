import { render, screen } from '@testing-library/react';
import { VenueMap } from '@/components/fan/VenueMap';
import { generateLiveSignals } from '@/lib/simulation/liveSignals';

describe('VenueMap', () => {
  it('renders an accessible route figure grounded in the live snapshot', () => {
    render(<VenueMap sectors={generateLiveSignals(1_700_000_000_000)} />);

    const map = screen.getByRole('img', { name: /step-free route/i });
    expect(map).toBeInTheDocument();
    // The non-accessible East Concourse must be visually flagged so the map
    // reasons about the same step-free fact as the concierge and alert engine.
    expect(screen.getByText('no step-free')).toBeInTheDocument();
  });
});
