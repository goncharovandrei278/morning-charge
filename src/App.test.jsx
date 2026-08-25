import { render, screen } from '@testing-library/react';
import App from './App.jsx';

test('renders placeholder heading', () => {
  render(<App />);
  expect(screen.getByText('Утренняя зарядка')).toBeInTheDocument();
});
