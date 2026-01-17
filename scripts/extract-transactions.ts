#!/usr/bin/env bun

/**
 * Extract all transactions from Endowus Activity & Balances page
 * Prerequisites: Browser must be open and logged in to Endowus
 */

import { $ } from "bun";

interface Transaction {
  date: string;
  type: string;
  amount: string;
  status: string;
}

async function run(cmd: string): Promise<string> {
  const result = await $`npx agent-browser ${cmd.split(" ")}`.text();
  return result.trim();
}

async function navigateToActivityBalances(): Promise<void> {
  console.log("Navigating to Activity & Balances...");
  await run('find text "Activity & Balances" click');
  await Bun.sleep(2000);
}

async function loadAllTransactions(): Promise<void> {
  console.log("Loading all transactions...");
  let loaded = 0;
  
  while (true) {
    try {
      await run('find text "Load more" click');
      loaded++;
      process.stdout.write(`\rLoaded batch ${loaded}...`);
      await Bun.sleep(800);
    } catch {
      break;
    }
  }
  console.log(`\nFinished loading ${loaded} batches`);
}

async function extractTransactions(): Promise<Transaction[]> {
  console.log("Extracting transaction data...");
  
  const jsCode = `
    Array.from(document.querySelectorAll('table')[1]?.querySelectorAll('tbody tr') || [])
      .map(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 4) {
          return {
            date: cells[0].innerText.trim(),
            type: cells[1].innerText.replace(/\\n/g, ' ').trim(),
            amount: cells[2].innerText.trim(),
            status: cells[3].innerText.trim()
          };
        }
        return null;
      })
      .filter(x => x && !x.type.includes('Load more'))
  `;
  
  const result = await run(`eval "${jsCode.replace(/"/g, '\\"')}" --json`);
  
  try {
    return JSON.parse(result);
  } catch {
    console.error("Failed to parse transactions, raw output:", result);
    return [];
  }
}

async function getAccountSummary(): Promise<{ investmentValue: string; cashBalance: string }> {
  const jsCode = `
    (() => {
      const text = document.body.innerText;
      const investmentMatch = text.match(/Investment value\\s+S\\$([\\d,]+\\.\\d+)/);
      const cashMatch = text.match(/SGD Cash\\s+S\\$([\\d,]+\\.\\d+)/);
      return {
        investmentValue: investmentMatch ? 'S$' + investmentMatch[1] : 'N/A',
        cashBalance: cashMatch ? 'S$' + cashMatch[1] : 'N/A'
      };
    })()
  `;
  
  const result = await run(`eval "${jsCode.replace(/"/g, '\\"')}" --json`);
  
  try {
    return JSON.parse(result);
  } catch {
    return { investmentValue: "N/A", cashBalance: "N/A" };
  }
}

function formatTransactions(transactions: Transaction[]): void {
  console.log("\n" + "=".repeat(80));
  console.log("ENDOWUS TRANSACTIONS");
  console.log("=".repeat(80));
  
  console.log(`\nTotal transactions: ${transactions.length}\n`);
  
  console.log("Date".padEnd(15) + "Type".padEnd(50) + "Amount".padEnd(15) + "Status");
  console.log("-".repeat(80));
  
  for (const tx of transactions) {
    const date = tx.date.split("\n")[0].padEnd(15);
    const type = tx.type.substring(0, 48).padEnd(50);
    const amount = tx.amount.padEnd(15);
    console.log(`${date}${type}${amount}${tx.status}`);
  }
}

async function main(): Promise<void> {
  console.log("Endowus Transaction Extractor");
  console.log("============================\n");
  
  try {
    // Navigate to Activity & Balances
    await navigateToActivityBalances();
    
    // Get account summary
    const summary = await getAccountSummary();
    console.log(`\nInvestment Value: ${summary.investmentValue}`);
    console.log(`SGD Cash Balance: ${summary.cashBalance}\n`);
    
    // Load all transactions
    await loadAllTransactions();
    
    // Extract and format
    const transactions = await extractTransactions();
    formatTransactions(transactions);
    
    // Summary by type
    const byType = new Map<string, number>();
    for (const tx of transactions) {
      const type = tx.type.split(" ")[0];
      byType.set(type, (byType.get(type) || 0) + 1);
    }
    
    console.log("\n" + "=".repeat(80));
    console.log("SUMMARY BY TYPE");
    console.log("=".repeat(80));
    for (const [type, count] of byType.entries()) {
      console.log(`${type}: ${count}`);
    }
    
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

main();
