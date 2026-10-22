import React from 'react';
import { render, screen } from '@testing-library/react';
import { it, expect, vi } from 'vitest';
import ProductManager from './ProductManager';
import InventoryManager from './InventoryManager';
vi.mock('../../lib/supabase',()=>({supabase:null}));
it.each([['products',ProductManager],['inventory',InventoryManager]])('does not invent %s or stock quantities when the backend is unavailable',async(_name,Component)=>{
  render(<Component/>);
  await screen.findByText('Store database is not connected.');
  expect(screen.queryByText('Fresh Paneer (500g)')).not.toBeInTheDocument();
});
