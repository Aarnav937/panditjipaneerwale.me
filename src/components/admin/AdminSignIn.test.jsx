import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AdminSignIn from './AdminSignIn';
const mocks=vi.hoisted(()=>({send:vi.fn(),verify:vi.fn(),password:vi.fn()}));
vi.mock('../../lib/supabase',()=>({supabase:{auth:{signInWithOtp:mocks.send,verifyOtp:mocks.verify,signInWithPassword:mocks.password}}}));
vi.mock('../../context/AdminContext',()=>({useAdmin:()=>({checkingAdmin:false,adminError:'',adminEmail:'',logoutAdmin:vi.fn()})}));
describe('administrator email-code sign-in',()=>{
  it('keeps delivery failures visible and never claims a code was sent',async()=>{
    mocks.send.mockResolvedValue({error:{message:'Email delivery unavailable'}});
    render(<AdminSignIn onClose={()=>{}}/>);
    fireEvent.click(screen.getByRole('button',{name:'Email code',exact:true}));
    fireEvent.change(screen.getByLabelText('Admin email'),{target:{value:'staff@example.com'}});
    fireEvent.click(screen.getByRole('button',{name:'Send sign-in code',exact:true}));
    await screen.findByRole('alert');
    expect(screen.queryByLabelText('Sign-in code')).not.toBeInTheDocument();
  });
  it('verifies a delivered code with Supabase and leaves authorization to the server',async()=>{
    mocks.send.mockResolvedValue({error:null}); mocks.verify.mockResolvedValue({error:null});
    render(<AdminSignIn onClose={()=>{}}/>);
    fireEvent.click(screen.getByRole('button',{name:'Email code',exact:true}));
    fireEvent.change(screen.getByLabelText('Admin email'),{target:{value:'staff@example.com'}});
    fireEvent.click(screen.getByRole('button',{name:'Send sign-in code',exact:true}));
    fireEvent.change(await screen.findByLabelText('Sign-in code'),{target:{value:'123456'}});
    fireEvent.click(screen.getByRole('button',{name:'Verify code',exact:true}));
    await waitFor(()=>expect(mocks.verify).toHaveBeenCalledWith({email:'staff@example.com',token:'123456',type:'email'}));
  });
});
