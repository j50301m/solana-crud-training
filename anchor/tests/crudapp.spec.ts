import * as anchor from '@coral-xyz/anchor'
import {Program} from '@coral-xyz/anchor'
import {Keypair,PublicKey} from '@solana/web3.js'
import {Crudapp} from '../target/types/crudapp'
import { BankrunProvider, startAnchor } from "anchor-bankrun";
import exp from 'constants';

const IDL = require('../target/idl/crudapp.json')
const programId = new PublicKey("6n1cENEPtF8VFxQNb3zGkjUMgxoDVrZr2zh4JNU3LiSN");

describe('crudapp', () => {
  let context;
  let provider: BankrunProvider;
  anchor.setProvider(anchor.AnchorProvider.env());
  let program = anchor.workspace.Crudapp as Program<Crudapp>;

  beforeAll(async () => {
    context = await startAnchor('',[{name:'Crudapp',programId: programId}],[]);
    provider = new BankrunProvider(context);
    program = new Program(IDL, provider);
  });

  it('Create journal entry', async () => {
    // Define args
    const owner = provider.wallet.publicKey;
    const title = 'Hello world!!';
    const message = 'This is a message';

    // Find out the pda
    const [entryPda,_bump] = PublicKey.findProgramAddressSync(
      [
        Buffer.from(title),
        owner.toBuffer(),
      ],
      program.programId
    );

    // Create the journal entry
    await program.methods.createJournalEntry(title, message).rpc();


    // Verify the journal entry
    const account = await program.account.journalEntryState.fetch(entryPda);
    console.log(account);

    expect(account.title).toBe(title);
    expect(account.message).toBe(message);
    expect(account.owner.toString()).toEqual(owner.toString());
  });

  it('Update journal entry', async () => {
    // Define args
    const owner = provider.wallet.publicKey;
    const title = 'Test Update';
    const message = 'This is a message';

    // Find out the pda
    const [entryPda,_bump] = PublicKey.findProgramAddressSync(
      [
        Buffer.from(title),
        owner.toBuffer(),
      ],
      program.programId
    );

    // Create the journal entry
    await program.methods.createJournalEntry(title, message).rpc();

    // Update the journal entry
    const newMessage = 'This is a new message';
    await program.methods.updateJournalEntry(title, newMessage).rpc();

    // Verify the journal entry
    const account = await program.account.journalEntryState.fetch(entryPda);
    console.log(account);

    expect(account.title).toBe(title);
    expect(account.message).toBe(newMessage);
    expect(account.owner.toString()).toEqual(owner.toString());
  });

  it('Delete journal entry', async () => {
    // Define args
    const owner = provider.wallet.publicKey;
    const title = 'Test Delete';
    const message = 'This is a message';

    // Find out the pda
    const [entryPda,_bump] = PublicKey.findProgramAddressSync(
      [
        Buffer.from(title),
        owner.toBuffer(),
      ],
      program.programId
    );

    // Create the journal entry
    await program.methods.createJournalEntry(title, message).rpc();

    // Delete the journal entry
    await program.methods.deleteJournalEntry(title).rpc();

    // Verify the journal entry
    const accountInfo = await program.account.journalEntryState.fetch(entryPda).catch((err) => {
      expect(err).toBeDefined();
      const anchorError = err as anchor.AnchorError;
      expect(anchorError.message).toContain('Could not find')
    });
    expect(accountInfo).toBeUndefined();
  });
})
