import { fireEvent, render, screen } from '@testing-library/react';
import { FanChat } from '@/components/fan/FanChat';

describe('FanChat accessibility and interaction', () => {
  it('renders an accessible, live conversation log', () => {
    render(<FanChat />);

    const log = screen.getByRole('log');
    expect(log).toHaveAttribute('aria-live', 'polite');
  });

  it('exposes language options as accessible tabs with selection state', () => {
    render(<FanChat />);

    const tabs = screen.getAllByRole('tab');
    expect(tabs).toHaveLength(3);

    // Spanish is the default selected language.
    const spanishTab = screen.getByRole('tab', { name: /switch language to espanol/i });
    expect(spanishTab).toHaveAttribute('aria-selected', 'true');

    const englishTab = screen.getByRole('tab', { name: /switch language to english/i });
    fireEvent.click(englishTab);

    expect(englishTab).toHaveAttribute('aria-selected', 'true');
    expect(spanishTab).toHaveAttribute('aria-selected', 'false');
  });

  it('labels the message input for assistive technology', () => {
    render(<FanChat />);

    const input = screen.getByLabelText(/ask about routes, accessibility/i);
    expect(input).toHaveAttribute('maxLength', '500');
  });
});
