// VinTrek Trail NFT Minting Contract
// This Aiken smart contract handles the minting of trail completion NFTs

use aiken/hash.{Blake2b_224, Hash}
use aiken/list
use aiken/transaction.{ScriptContext, Spend, find_input, find_output}
use aiken/transaction/credential.{VerificationKey}
use aiken/transaction/value.{PolicyId, AssetName, Value, from_lovelace, quantity_of}

// Trail completion data structure
type TrailCompletion {
  trail_id: ByteArray,
  hiker_address: Hash<Blake2b_224, VerificationKey>,
  completion_timestamp: Int,
  gps_coordinates: ByteArray,
  difficulty_level: Int, // 1=Easy, 2=Moderate, 3=Hard
}

// NFT metadata structure
type NFTMetadata {
  name: ByteArray,
  description: ByteArray,
  image: ByteArray,
  trail_name: ByteArray,
  location: ByteArray,
  completion_date: ByteArray,
}

// Validator for trail NFT minting
validator(policy_id: PolicyId) {
  fn mint_trail_nft(redeemer: TrailCompletion, context: ScriptContext) -> Bool {
    let ScriptContext { transaction, purpose } = context
    
    expect Mint(policy_id) = purpose
    
    // Check that exactly one NFT is being minted
    let minted_value = value.from_minted_value(transaction.mint)
    let nft_quantity = quantity_of(minted_value, policy_id, "")
    
    // Validate trail completion requirements
    and {
      // Exactly one NFT should be minted
      nft_quantity == 1,
      
      // Trail ID must be valid (non-empty)
      !list.is_empty(redeemer.trail_id),
      
      // Completion timestamp must be reasonable (not in future)
      redeemer.completion_timestamp <= transaction.validity_range.upper_bound.finite,
      
      // GPS coordinates must be provided
      !list.is_empty(redeemer.gps_coordinates),
      
      // Difficulty level must be valid (1-3)
      redeemer.difficulty_level >= 1 && redeemer.difficulty_level <= 3,
      
      // NFT must be sent to the hiker's address
      validate_nft_recipient(transaction, redeemer.hiker_address, policy_id),
    }
  }
}

// Helper function to validate NFT recipient
fn validate_nft_recipient(
  transaction: Transaction,
  hiker_address: Hash<Blake2b_224, VerificationKey>,
  policy_id: PolicyId,
) -> Bool {
  expect Some(output) = 
    list.find(
      transaction.outputs,
      fn(output) {
        let has_nft = quantity_of(output.value, policy_id, "") == 1
        let correct_address = output.address.payment_credential == VerificationKey(hiker_address)
        has_nft && correct_address
      }
    )
  True
}

// TREK Token Reward Contract
validator {
  fn mint_trek_tokens(redeemer: TrailCompletion, context: ScriptContext) -> Bool {
    let ScriptContext { transaction, purpose } = context
    
    expect Mint(policy_id) = purpose
    
    // Calculate reward amount based on difficulty
    let reward_amount = calculate_trek_reward(redeemer.difficulty_level)
    
    // Check that correct amount of TREK tokens is being minted
    let minted_value = value.from_minted_value(transaction.mint)
    let trek_quantity = quantity_of(minted_value, policy_id, "TREK")
    
    and {
      // Correct reward amount
      trek_quantity == reward_amount,
      
      // Tokens must be sent to hiker
      validate_trek_recipient(transaction, redeemer.hiker_address, policy_id, reward_amount),
    }
  }
}

// Calculate TREK token reward based on trail difficulty
fn calculate_trek_reward(difficulty: Int) -> Int {
  when difficulty is {
    1 -> 50_000_000  // Easy: 50 TREK (6 decimals)
    2 -> 75_000_000  // Moderate: 75 TREK
    3 -> 100_000_000 // Hard: 100 TREK
    _ -> 50_000_000  // Default: 50 TREK
  }
}

// Helper function to validate TREK token recipient
fn validate_trek_recipient(
  transaction: Transaction,
  hiker_address: Hash<Blake2b_224, VerificationKey>,
  policy_id: PolicyId,
  expected_amount: Int,
) -> Bool {
  expect Some(output) = 
    list.find(
      transaction.outputs,
      fn(output) {
        let has_trek = quantity_of(output.value, policy_id, "TREK") == expected_amount
        let correct_address = output.address.payment_credential == VerificationKey(hiker_address)
        has_trek && correct_address
      }
    )
  True
}

// Booking validation contract
validator {
  fn validate_booking(datum: BookingDatum, redeemer: BookingRedeemer, context: ScriptContext) -> Bool {
    let ScriptContext { transaction, purpose } = context
    
    expect Spend(output_reference) = purpose
    expect Some(input) = find_input(transaction.inputs, output_reference)
    
    // Validate booking payment
    let booking_payment = value.lovelace_of(input.output.value)
    let expected_payment = datum.trail_price * datum.participants
    
    and {
      // Correct payment amount
      booking_payment >= expected_payment,
      
      // Booking date is in the future
      datum.booking_date > transaction.validity_range.lower_bound.finite,
      
      // Trail capacity not exceeded
      datum.participants <= datum.max_capacity,
    }
  }
}

// Booking data structures
type BookingDatum {
  trail_id: ByteArray,
  hiker_address: Hash<Blake2b_224, VerificationKey>,
  booking_date: Int,
  participants: Int,
  trail_price: Int,
  max_capacity: Int,
}

type BookingRedeemer {
  action: BookingAction,
}

type BookingAction {
  Confirm
  Cancel
}
