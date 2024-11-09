'use client'

import { PublicKey } from '@solana/web3.js'
import { useCrudappProgram, useCrudappProgramAccount } from './crudapp-data-access'
import { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'

export function CrudappCreate() {
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const { createEntry, programId } = useCrudappProgram()
  const { publicKey } = useWallet();

  const isFormValid = title.trim() !== '' && message.trim() !== ''

  const handleSubmit = () => {
    if (publicKey && isFormValid) {
      console.log('publicKey: ', publicKey.toString())
      console.log('programId: ', programId.toString())
      createEntry.mutateAsync({ title, message, owner: publicKey })
    }
  }

  if (!publicKey) {
    return <p>Connect your wallet</p>
  }

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title text-2xl font-bold mb-6">Create New Journal Entry</h2>

        <div className="space-y-6">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Title</span>
            </label>
            <input
              type="text"
              placeholder="Enter your title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input input-bordered w-full"
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Message</span>
            </label>
            <textarea
              placeholder="Write your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="textarea textarea-bordered w-full min-h-[150px]"
            />
          </div>

          <div className="flex justify-between items-center mt-6">
            <div className="text-sm text-base-content/70">
              Connected: {publicKey.toString().slice(0, 4)}...{publicKey.toString().slice(-4)}
            </div>
            <button
              onClick={handleSubmit}
              disabled={createEntry.isPending || !isFormValid}
              className="btn btn-primary"
            >
              {createEntry.isPending ? (
                <>
                  <span className="loading loading-spinner loading-sm mr-2"></span>
                  Creating...
                </>
              ) : (
                'Create Journal Entry'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

}

export function CrudappList() {
  const { accounts, getProgramAccount } = useCrudappProgram()

  if (getProgramAccount.isLoading) {
    return <span className="loading loading-spinner loading-lg"></span>
  }
  if (!getProgramAccount.data?.value) {
    return (
      <div className="alert alert-info flex justify-center">
        <span>Program account not found. Make sure you have deployed the program and are on the correct cluster.</span>
      </div>
    )
  }
  return (
    <div className={'space-y-6'}>
      {accounts.isLoading ? (
        <span className="loading loading-spinner loading-lg"></span>
      ) : accounts.data?.length ? (
        <div className="grid md:grid-cols-2 gap-4">
          {accounts.data?.map((account) => (
            <CrudappCard key={account.publicKey.toString()} account={account.publicKey} />
          ))}
        </div>
      ) : (
        <div className="text-center">
          <h2 className={'text-2xl'}>No accounts</h2>
          No accounts found. Create one above to get started.
        </div>
      )}
    </div>
  )
}

function CrudappCard({ account }: { account: PublicKey }) {
  const { accountQuery, updateEntry, deleteEntry } = useCrudappProgramAccount({
    account,
  });

  const { publicKey } = useWallet();
  const [message, setMessage] = useState("");
  const title = accountQuery.data?.title;
  const isFormValid = message.trim() !== "";

  const handleSubmit = () => {
    if (publicKey && isFormValid && title) {
      updateEntry.mutateAsync({ title, message, owner: publicKey });
    }
  };

  if (!publicKey) {
    return <p>Connect your wallet</p>;
  }

  return accountQuery.isLoading ? (
    <span className="loading loading-spinner loading-lg"></span>) : (
    <div className="card card-bordered border-base-300 border-4 text-neutral-context">
      <div className="card-body items-center text-center">
        <div className="space-y-6">
          <h2
            className="card-title justify-center text-3xl cursor-pointer"
            onClick={() => accountQuery.refetch()}
          >{accountQuery.data?.title}</h2>
          <p>{accountQuery.data?.message}</p>
          <div className="card-actions justify-around">
            <textarea
              placeholder='Message'
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className='textarea textarea-bordered w-full max-w-xs'
            />
            <button
              onClick={handleSubmit}
              disabled={updateEntry.isPending || !isFormValid}
              className="btn btn-xs lg:btn-md btn-primary"
            > Update Journal Entry
            </button>
            <button
              onClick={() => {
                const title = accountQuery.data?.title;
                if (title) {
                  return deleteEntry.mutateAsync(title);
                }
              }}
              disabled={deleteEntry.isPending}
              className="btn btn-xs lg:btn-md btn-error"
            > Delete Journal Entry
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
