#!/usr/bin/env bun

/**
 * Extract portfolio holdings from Endowus Portfolio page
 * Prerequisites: Browser must be open and logged in to Endowus
 */

import { $ } from "bun";

interface Fund {
  name: string;
  isin: string;
  allocation: string;
}

interface Holding {
  name: string;
  allocation: string;
}

interface Goal {
  name: string;
  value: string;
  returnAmount: string;
  returnPercent: string;
}

async function run(cmd: string): Promise<string> {
  const result = await $`npx agent-browser ${cmd.split(" ")}`.text();
  return result.trim();
}

async function navigateToPortfolio(): Promise<void> {
  console.log("Navigating to Portfolio...");
  await run('find text "Portfolio" click');
  await Bun.sleep(2000);
}

async function getAssetAllocation(): Promise<{ equities: string; fixedIncome: string }> {
  const jsCode = `
    (() => {
      const text = document.body.innerText;
      const equitiesMatch = text.match(/Equities\\s+(\\d+\\.\\d+)%/);
      const fixedMatch = text.match(/Fixed income\\s+(\\d+\\.\\d+)%/);
      return {
        equities: equitiesMatch ? equitiesMatch[1] + '%' : 'N/A',
        fixedIncome: fixedMatch ? fixedMatch[1] + '%' : 'N/A'
      };
    })()
  `;
  
  const result = await run(`eval "${jsCode.replace(/"/g, '\\"')}" --json`);
  try {
    return JSON.parse(result);
  } catch {
    return { equities: "N/A", fixedIncome: "N/A" };
  }
}

async function getUnderlyingFunds(): Promise<Fund[]> {
  const jsCode = `
    Array.from(document.querySelectorAll('table')[0]?.querySelectorAll('tbody tr') || [])
      .map(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 2) {
          const text = cells[0].innerText;
          const isinMatch = text.match(/([A-Z]{2}[A-Z0-9]{10})/);
          const nameMatch = text.match(/(?:Accumulating|Distributing)\\s+(.+?)\\s+[A-Z]{2}/);
          return {
            name: nameMatch ? nameMatch[1] : text.split('\\n').slice(-2, -1)[0] || text,
            isin: isinMatch ? isinMatch[1] : '',
            allocation: cells[1].innerText.trim()
          };
        }
        return null;
      })
      .filter(x => x && x.allocation)
  `;
  
  const result = await run(`eval "${jsCode.replace(/"/g, '\\"')}" --json`);
  try {
    return JSON.parse(result);
  } catch {
    return [];
  }
}

async function getTopHoldings(): Promise<Holding[]> {
  // First click on Top 10 holdings tab
  try {
    await run('find text "Top 10 holdings" click');
    await Bun.sleep(1000);
  } catch {
    // Already on holdings tab or not available
  }
  
  const jsCode = `
    Array.from(document.querySelectorAll('table')[1]?.querySelectorAll('tbody tr') || [])
      .map(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 2) {
          return {
            name: cells[0].innerText.trim(),
            allocation: cells[1].innerText.trim()
          };
        }
        return null;
      })
      .filter(x => x && x.allocation && x.allocation.includes('%'))
  `;
  
  const result = await run(`eval "${jsCode.replace(/"/g, '\\"')}" --json`);
  try {
    return JSON.parse(result);
  } catch {
    return [];
  }
}

async function getTopMarkets(): Promise<Holding[]> {
  try {
    await run('find text "Top 10 markets" click');
    await Bun.sleep(1000);
  } catch {
    // Already on markets tab or not available
  }
  
  const jsCode = `
    Array.from(document.querySelectorAll('table')[1]?.querySelectorAll('tbody tr') || [])
      .map(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 2) {
          return {
            name: cells[0].innerText.trim(),
            allocation: cells[1].innerText.trim()
          };
        }
        return null;
      })
      .filter(x => x && x.allocation && x.allocation.includes('%'))
  `;
  
  const result = await run(`eval "${jsCode.replace(/"/g, '\\"')}" --json`);
  try {
    return JSON.parse(result);
  } catch {
    return [];
  }
}

async function getGoals(): Promise<Goal[]> {
  const jsCode = `
    Array.from(document.querySelectorAll('nav[aria-label="goal list"] button'))
      .map(btn => btn.innerText.trim())
      .filter(x => x)
  `;
  
  const result = await run(`eval "${jsCode.replace(/"/g, '\\"')}" --json`);
  try {
    return JSON.parse(result).map((name: string) => ({
      name,
      value: "N/A",
      returnAmount: "N/A", 
      returnPercent: "N/A"
    }));
  } catch {
    return [];
  }
}

async function getGoalDetails(goalName: string): Promise<Goal> {
  console.log(`  Getting details for ${goalName}...`);
  
  try {
    await run(`find text "${goalName}" click`);
    await Bun.sleep(1500);
  } catch {
    return { name: goalName, value: "N/A", returnAmount: "N/A", returnPercent: "N/A" };
  }
  
  const jsCode = `
    (() => {
      const text = document.body.innerText;
      const valueMatch = text.match(/Investment value\\s+S\\$([\\d,]+\\.\\d+)/);
      const returnMatch = text.match(/Total return\\s+S\\$([\\d,]+\\.\\d+)\\s+([+-]?\\d+\\.\\d+%)/);
      const negReturnMatch = text.match(/Total return\\s+-S\\$([\\d,]+\\.\\d+)\\s+([+-]?\\d+\\.\\d+%)/);
      return {
        value: valueMatch ? 'S$' + valueMatch[1] : 'S$0.00',
        returnAmount: returnMatch ? 'S$' + returnMatch[1] : (negReturnMatch ? '-S$' + negReturnMatch[1] : 'N/A'),
        returnPercent: returnMatch ? returnMatch[2] : (negReturnMatch ? negReturnMatch[2] : 'N/A')
      };
    })()
  `;
  
  const result = await run(`eval "${jsCode.replace(/"/g, '\\"')}" --json`);
  try {
    const details = JSON.parse(result);
    return { name: goalName, ...details };
  } catch {
    return { name: goalName, value: "N/A", returnAmount: "N/A", returnPercent: "N/A" };
  }
}

function printSection(title: string): void {
  console.log("\n" + "=".repeat(60));
  console.log(title);
  console.log("=".repeat(60));
}

async function main(): Promise<void> {
  console.log("Endowus Portfolio Extractor");
  console.log("===========================\n");
  
  try {
    // Navigate to Portfolio
    await navigateToPortfolio();
    
    // Asset Allocation
    printSection("ASSET ALLOCATION");
    const allocation = await getAssetAllocation();
    console.log(`Equities: ${allocation.equities}`);
    console.log(`Fixed Income: ${allocation.fixedIncome}`);
    
    // Underlying Funds
    printSection("UNDERLYING FUNDS");
    const funds = await getUnderlyingFunds();
    for (const fund of funds) {
      console.log(`${fund.allocation.padEnd(8)} ${fund.name}`);
    }
    
    // Top Holdings
    printSection("TOP 10 HOLDINGS");
    const holdings = await getTopHoldings();
    for (let i = 0; i < holdings.length; i++) {
      console.log(`${(i + 1).toString().padStart(2)}. ${holdings[i].name.padEnd(45)} ${holdings[i].allocation}`);
    }
    
    // Top Markets
    printSection("TOP 10 MARKETS");
    const markets = await getTopMarkets();
    for (let i = 0; i < markets.length; i++) {
      console.log(`${(i + 1).toString().padStart(2)}. ${markets[i].name.padEnd(20)} ${markets[i].allocation}`);
    }
    
    // Goals Summary
    printSection("GOALS SUMMARY");
    const goals = await getGoals();
    const goalDetails: Goal[] = [];
    
    for (const goal of goals) {
      const details = await getGoalDetails(goal.name);
      goalDetails.push(details);
    }
    
    console.log("\n" + "Goal".padEnd(30) + "Value".padEnd(18) + "Return".padEnd(18) + "%");
    console.log("-".repeat(75));
    for (const goal of goalDetails) {
      console.log(
        goal.name.padEnd(30) + 
        goal.value.padEnd(18) + 
        goal.returnAmount.padEnd(18) + 
        goal.returnPercent
      );
    }
    
    // Calculate total
    const totalValue = goalDetails.reduce((sum, g) => {
      const val = parseFloat(g.value.replace(/[S$,]/g, "")) || 0;
      return sum + val;
    }, 0);
    
    const totalReturn = goalDetails.reduce((sum, g) => {
      const val = parseFloat(g.returnAmount.replace(/[S$,]/g, "")) || 0;
      return sum + val;
    }, 0);
    
    console.log("-".repeat(75));
    console.log(
      "TOTAL".padEnd(30) + 
      `S$${totalValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}`.padEnd(18) +
      `S$${totalReturn.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
    );
    
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

main();
