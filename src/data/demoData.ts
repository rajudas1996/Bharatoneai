import * as XLSX from 'xlsx';
import { Dataset, ColumnMeta, DataRow } from '../types/dashboard';

export const rawSampleData = [
  {
    "Sl. No.": 1,
    "Import Date": "12 Oct 2024",
    "Lead Source": "Website",
    "RM": "Murali Sishadri",
    "Lead Date": "10 Oct 2024",
    "Lead Current Status": "Active",
    "Remarks": "Follow up required for fire proposal",
    "LOB": "Engineering",
    "Policy Type": "Comprehensive",
    "Renewal Month": "Jan 2025",
    "Group": "Yes",
    "Company Name": "Shree Constructions Ltd",
    "Industry": "Infrastructure",
    "Sector": "Heavy Construction",
    "Corporate Office Address": "Bandra Kurla Complex, Plot C-12",
    "State": "Maharashtra",
    "City": "Mumbai",
    "Website": "www.shreecons.in",
    "Other Contact Person": "Rajesh Sharma",
    "Contact Number": "+91 98201 12345",
    "Email ID": "r.sharma@shreecons.in",
    "No. of Employees": 250,
    "Turnover (Cr)": 320.50,
    "Existing Premium": 4200000,
    "Policy No": "OG-24-1102-1801-00001234",
    "Broker Name": "Epoch Insurance Brokers",
    "Valid Upto": "31 Jan 2025",
    "Name of Insurance Company": "ICICI Lombard"
  },
  {
    "Sl. No.": 2,
    "Import Date": "12 Oct 2024",
    "Lead Source": "Direct",
    "RM": "Priya Nair",
    "Lead Date": "09 Oct 2024",
    "Lead Current Status": "Converted",
    "Remarks": "Policy issued successfully",
    "LOB": "Fire",
    "Policy Type": "Package",
    "Renewal Month": "Mar 2025",
    "Group": "No",
    "Company Name": "Bala Udyog Pvt Ltd",
    "Industry": "Manufacturing",
    "Sector": "Textiles & Garments",
    "Corporate Office Address": "Peenya Industrial Area, Phase 1",
    "State": "Karnataka",
    "City": "Bengaluru",
    "Website": "www.balaudyog.in",
    "Other Contact Person": "K. Balakrishnan",
    "Contact Number": "+91 98450 67890",
    "Email ID": "contact@balaudyog.in",
    "No. of Employees": 180,
    "Turnover (Cr)": 210.00,
    "Existing Premium": 2850000,
    "Policy No": "BAG-23-4401-2024-00009876",
    "Broker Name": "Epoch Insurance Brokers",
    "Valid Upto": "15 Mar 2025",
    "Name of Insurance Company": "Bajaj Allianz"
  },
  {
    "Sl. No.": 3,
    "Import Date": "11 Oct 2024",
    "Lead Source": "Referral",
    "RM": "Rohit Gupta",
    "Lead Date": "08 Oct 2024",
    "Lead Current Status": "Active",
    "Remarks": "Client meeting scheduled on Friday",
    "LOB": "Motor",
    "Policy Type": "Third Party",
    "Renewal Month": "Feb 2025",
    "Group": "Yes",
    "Company Name": "Westfield India Logistics",
    "Industry": "Logistics",
    "Sector": "Fleet Transportation",
    "Corporate Office Address": "Guindy Industrial Estate, Mount Rd",
    "State": "Tamil Nadu",
    "City": "Chennai",
    "Website": "www.westfield.in",
    "Other Contact Person": "Sunil Varma",
    "Contact Number": "+91 97909 34567",
    "Email ID": "s.varma@westfield.in",
    "No. of Employees": 420,
    "Turnover (Cr)": 540.00,
    "Existing Premium": 7500000,
    "Policy No": "TAG-24-9988-1002-00003412",
    "Broker Name": "Epoch Insurance Brokers",
    "Valid Upto": "28 Feb 2025",
    "Name of Insurance Company": "Tata AIG"
  },
  {
    "Sl. No.": 4,
    "Import Date": "11 Oct 2024",
    "Lead Source": "LinkedIn",
    "RM": "Amit Verma",
    "Lead Date": "07 Oct 2024",
    "Lead Current Status": "On Hold",
    "Remarks": "Awaiting audited balance sheet docs",
    "LOB": "Health",
    "Policy Type": "Group Medclaim",
    "Renewal Month": "Apr 2025",
    "Group": "No",
    "Company Name": "Southern Logistics Pvt Ltd",
    "Industry": "Logistics",
    "Sector": "Warehousing & Cold Chain",
    "Corporate Office Address": "Avinashi Road, Peelamedu",
    "State": "Tamil Nadu",
    "City": "Coimbatore",
    "Website": "www.southernlog.in",
    "Other Contact Person": "M. Ramanathan",
    "Contact Number": "+91 94432 55443",
    "Email ID": "m.ramanathan@southernlog.in",
    "No. of Employees": 600,
    "Turnover (Cr)": 780.00,
    "Existing Premium": 12000000,
    "Policy No": "HDFC-24-7711-4001-00006543",
    "Broker Name": "Epoch Insurance Brokers",
    "Valid Upto": "10 Apr 2025",
    "Name of Insurance Company": "HDFC ERGO"
  },
  {
    "Sl. No.": 5,
    "Import Date": "10 Oct 2024",
    "Lead Source": "Website",
    "RM": "Sneha Iyer",
    "Lead Date": "07 Oct 2024",
    "Lead Current Status": "Active",
    "Remarks": "Need proposal for D&O and cyber",
    "LOB": "Liability",
    "Policy Type": "Stand Alone",
    "Renewal Month": "May 2025",
    "Group": "No",
    "Company Name": "Kaveri Textiles Ltd",
    "Industry": "Manufacturing",
    "Sector": "Spinning & Weaving",
    "Corporate Office Address": "Senapati Bapat Road, Shivajinagar",
    "State": "Maharashtra",
    "City": "Pune",
    "Website": "www.kaveritextiles.in",
    "Other Contact Person": "Pooja Hegde",
    "Contact Number": "+91 98220 88990",
    "Email ID": "p.hegde@kaveritextiles.in",
    "No. of Employees": 320,
    "Turnover (Cr)": 410.00,
    "Existing Premium": 4200000,
    "Policy No": "RS-24-3321-9008-00007812",
    "Broker Name": "Epoch Insurance Brokers",
    "Valid Upto": "05 May 2025",
    "Name of Insurance Company": "Royal Sundaram"
  },
  {
    "Sl. No.": 6,
    "Import Date": "10 Oct 2024",
    "Lead Source": "Direct",
    "RM": "Murali Sishadri",
    "Lead Date": "06 Oct 2024",
    "Lead Current Status": "Active",
    "Remarks": "Quote sent, negotiating deductibles",
    "LOB": "Marine",
    "Policy Type": "Comprehensive",
    "Renewal Month": "Jun 2025",
    "Group": "Yes",
    "Company Name": "Adani Ports & Terminals",
    "Industry": "Infrastructure",
    "Sector": "Port Terminals & SEZ",
    "Corporate Office Address": "Navrangpura, SG Highway",
    "State": "Gujarat",
    "City": "Ahmedabad",
    "Website": "www.adaniports.com",
    "Other Contact Person": "Ketan Parikh",
    "Contact Number": "+91 98791 44332",
    "Email ID": "k.parikh@adani.com",
    "No. of Employees": 1200,
    "Turnover (Cr)": 1850.00,
    "Existing Premium": 24000000,
    "Policy No": "NIA-24-5544-3001-00004321",
    "Broker Name": "Epoch Insurance Brokers",
    "Valid Upto": "30 Jun 2025",
    "Name of Insurance Company": "New India Assurance"
  },
  {
    "Sl. No.": 7,
    "Import Date": "09 Oct 2024",
    "Lead Source": "Referral",
    "RM": "Karan Mehta",
    "Lead Date": "05 Oct 2024",
    "Lead Current Status": "Converted",
    "Remarks": "Renewed on time with 10% discount",
    "LOB": "Property",
    "Policy Type": "Package",
    "Renewal Month": "Jul 2025",
    "Group": "Yes",
    "Company Name": "DLF Commercial Assets",
    "Industry": "Real Estate",
    "Sector": "Commercial Towers",
    "Corporate Office Address": "Cyber City, DLF Phase 2",
    "State": "Delhi",
    "City": "Delhi",
    "Website": "www.dlf.in",
    "Other Contact Person": "Vikas Chawla",
    "Contact Number": "+91 98110 99887",
    "Email ID": "v.chawla@dlf.in",
    "No. of Employees": 450,
    "Turnover (Cr)": 920.00,
    "Existing Premium": 14500000,
    "Policy No": "ICICI-24-1188-7002-00001199",
    "Broker Name": "Epoch Insurance Brokers",
    "Valid Upto": "14 Jul 2025",
    "Name of Insurance Company": "ICICI Lombard"
  },
  {
    "Sl. No.": 8,
    "Import Date": "09 Oct 2024",
    "Lead Source": "Cold Call",
    "RM": "Vikram Rao",
    "Lead Date": "04 Oct 2024",
    "Lead Current Status": "Not Contacted",
    "Remarks": "Introductory deck dispatched",
    "LOB": "Engineering",
    "Policy Type": "Stand Alone",
    "Renewal Month": "Aug 2025",
    "Group": "No",
    "Company Name": "Deccan Auto Spares",
    "Industry": "Automotive",
    "Sector": "Engine Valves & Forgings",
    "Corporate Office Address": "HITEC City, Madhapur",
    "State": "Telangana",
    "City": "Hyderabad",
    "Website": "www.deccanauto.in",
    "Other Contact Person": "S. Reddy",
    "Contact Number": "+91 99890 22331",
    "Email ID": "s.reddy@deccanauto.in",
    "No. of Employees": 280,
    "Turnover (Cr)": 195.00,
    "Existing Premium": 3100000,
    "Policy No": "BAG-24-6655-1009-00008877",
    "Broker Name": "Epoch Insurance Brokers",
    "Valid Upto": "22 Aug 2025",
    "Name of Insurance Company": "Bajaj Allianz"
  },
  {
    "Sl. No.": 9,
    "Import Date": "08 Oct 2024",
    "Lead Source": "Website",
    "RM": "Murali Sishadri",
    "Lead Date": "03 Oct 2024",
    "Lead Current Status": "Active",
    "Remarks": "Renewal discussion ongoing",
    "LOB": "Fire",
    "Policy Type": "Comprehensive",
    "Renewal Month": "Sep 2025",
    "Group": "Yes",
    "Company Name": "Reliance Polymers Hub",
    "Industry": "Energy",
    "Sector": "Petrochemicals",
    "Corporate Office Address": "Reliance Corporate Park, Ghansoli",
    "State": "Maharashtra",
    "City": "Mumbai",
    "Website": "www.reliancepolymers.com",
    "Other Contact Person": "Hemant Desai",
    "Contact Number": "+91 98200 44112",
    "Email ID": "h.desai@ril.com",
    "No. of Employees": 2100,
    "Turnover (Cr)": 3800.00,
    "Existing Premium": 38000000,
    "Policy No": "TAG-24-7744-8001-00009944",
    "Broker Name": "Epoch Insurance Brokers",
    "Valid Upto": "15 Sep 2025",
    "Name of Insurance Company": "Tata AIG"
  },
  {
    "Sl. No.": 10,
    "Import Date": "08 Oct 2024",
    "Lead Source": "Referral",
    "RM": "Rohit Gupta",
    "Lead Date": "02 Oct 2024",
    "Lead Current Status": "Lost",
    "Remarks": "Price competition with PSU broker",
    "LOB": "Motor",
    "Policy Type": "Third Party",
    "Renewal Month": "Oct 2025",
    "Group": "No",
    "Company Name": "Apex Freight Express",
    "Industry": "Logistics",
    "Sector": "Intercity Transport",
    "Corporate Office Address": "Transport Nagar, Ring Road",
    "State": "UP",
    "City": "Lucknow",
    "Website": "www.apexfreight.in",
    "Other Contact Person": "Anil Agarwal",
    "Contact Number": "+91 94150 11223",
    "Email ID": "a.agarwal@apexfreight.in",
    "No. of Employees": 140,
    "Turnover (Cr)": 88.00,
    "Existing Premium": 1950000,
    "Policy No": "HDFC-24-3322-1008-00004455",
    "Broker Name": "Epoch Insurance Brokers",
    "Valid Upto": "08 Oct 2025",
    "Name of Insurance Company": "HDFC ERGO"
  },
  {
    "Sl. No.": 11,
    "Import Date": "07 Oct 2024",
    "Lead Source": "Direct",
    "RM": "Priya Nair",
    "Lead Date": "01 Oct 2024",
    "Lead Current Status": "Active",
    "Remarks": "Proposal revision requested",
    "LOB": "Health",
    "Policy Type": "Comprehensive",
    "Renewal Month": "Nov 2025",
    "Group": "Yes",
    "Company Name": "Infosys BPM Services",
    "Industry": "Information Technology",
    "Sector": "Business Process Mgmt",
    "Corporate Office Address": "Electronics City, Hosur Road",
    "State": "Karnataka",
    "City": "Bengaluru",
    "Website": "www.infosys.com",
    "Other Contact Person": "Deepak Menon",
    "Contact Number": "+91 98451 99001",
    "Email ID": "d.menon@infosys.com",
    "No. of Employees": 4500,
    "Turnover (Cr)": 5200.00,
    "Existing Premium": 48500000,
    "Policy No": "ICICI-24-9900-5001-00006611",
    "Broker Name": "Epoch Insurance Brokers",
    "Valid Upto": "30 Nov 2025",
    "Name of Insurance Company": "ICICI Lombard"
  },
  {
    "Sl. No.": 12,
    "Import Date": "07 Oct 2024",
    "Lead Source": "Website",
    "RM": "Sneha Iyer",
    "Lead Date": "30 Sep 2024",
    "Lead Current Status": "Active",
    "Remarks": "Site survey scheduled for marine risk",
    "LOB": "Marine",
    "Policy Type": "Package",
    "Renewal Month": "Dec 2025",
    "Group": "No",
    "Company Name": "Kandla Marine Exports",
    "Industry": "Logistics",
    "Sector": "Seafood & Marine Cargo",
    "Corporate Office Address": "Kandla Port Trust Complex, Gandhidham",
    "State": "Gujarat",
    "City": "Kandla",
    "Website": "www.kandlamarine.in",
    "Other Contact Person": "Mahesh Joshi",
    "Contact Number": "+91 98252 66778",
    "Email ID": "m.joshi@kandlamarine.in",
    "No. of Employees": 220,
    "Turnover (Cr)": 310.00,
    "Existing Premium": 5800000,
    "Policy No": "RS-24-4411-2003-00008899",
    "Broker Name": "Epoch Insurance Brokers",
    "Valid Upto": "18 Dec 2025",
    "Name of Insurance Company": "Royal Sundaram"
  }
];

export function getDemoDataset(): Dataset {
  const rows: DataRow[] = rawSampleData.map((item, idx) => ({
    __id: `row-${idx + 1}`,
    ...item
  }));

  const sampleHeaders = Object.keys(rawSampleData[0]);

  const columns: ColumnMeta[] = sampleHeaders.map((header) => {
    const lower = header.toLowerCase();
    const uniqueValues = Array.from(new Set(rawSampleData.map((d: any) => String(d[header]))));

    let type: ColumnMeta['type'] = 'text';
    let role: ColumnMeta['role'] = 'general';
    let min: number | undefined;
    let max: number | undefined;
    let sum: number | undefined;
    let avg: number | undefined;

    if (header === 'Existing Premium') {
      type = 'numeric';
      role = 'premium';
      const nums = rawSampleData.map((d) => d["Existing Premium"]);
      min = Math.min(...nums);
      max = Math.max(...nums);
      sum = nums.reduce((a, b) => a + b, 0);
      avg = sum / nums.length;
    } else if (header === 'Turnover (Cr)') {
      type = 'numeric';
      role = 'revenue';
      const nums = rawSampleData.map((d) => d["Turnover (Cr)"]);
      min = Math.min(...nums);
      max = Math.max(...nums);
      sum = nums.reduce((a, b) => a + b, 0);
      avg = sum / nums.length;
    } else if (header === 'No. of Employees') {
      type = 'numeric';
      role = 'count';
      const nums = rawSampleData.map((d) => Number(d[header as keyof typeof d]) || 0);
      min = Math.min(...nums);
      max = Math.max(...nums);
      sum = nums.reduce((a, b) => a + b, 0);
      avg = sum / nums.length;
    } else if (header === 'Sl. No.') {
      type = 'numeric';
      role = 'general';
      // Do not assign sum/avg to serial numbers
    } else if (header === 'Company Name') {
      type = 'text';
      role = 'entity_name';
    } else if (header === 'Industry' || header === 'Sector') {
      type = 'categorical';
      role = 'industry';
    } else if (header === 'State') {
      type = 'categorical';
      role = 'location_state';
    } else if (header === 'City') {
      type = 'categorical';
      role = 'location_city';
    } else if (header === 'Lead Current Status') {
      type = 'categorical';
      role = 'status';
    } else if (header === 'RM') {
      type = 'categorical';
      role = 'agent';
    } else if (header === 'LOB') {
      type = 'categorical';
      role = 'lob';
    } else if (header === 'Policy Type') {
      type = 'categorical';
      role = 'policy_type';
    } else if (header === 'Renewal Month') {
      type = 'categorical';
      role = 'renewal_month';
    } else if (header === 'Lead Source') {
      type = 'categorical';
      role = 'lead_source';
    } else if (header.includes('Date')) {
      type = 'date';
      role = 'date';
    } else if (uniqueValues.length <= 15) {
      type = 'categorical';
    }

    return {
      key: header,
      name: header,
      type,
      role,
      uniqueValues,
      min,
      max,
      sum,
      avg,
      nullCount: 0,
      totalCount: rows.length,
    };
  });

  return {
    fileName: 'Master_Lead_Sheet_2024.xlsx',
    sheetName: 'Master Lead Sheet',
    availableSheets: ['Master Lead Sheet', 'Renewal Tracker', 'RM Portfolio'],
    columns,
    rows,
    totalRows: rows.length,
    totalColumns: columns.length,
    uploadedAt: '12 Oct 2024, 10:45 AM',
    isDemo: false,
  };
}

export function getDemoWorkbook(): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Master Lead Sheet
  const ws1 = XLSX.utils.json_to_sheet(rawSampleData);
  XLSX.utils.book_append_sheet(wb, ws1, 'Master Lead Sheet');

  // Sheet 2: Renewal Tracker
  const renewalData = rawSampleData.map((d, i) => ({
    "Sl. No.": i + 1,
    "Company Name": d["Company Name"],
    "Renewal Month": d["Renewal Month"],
    "LOB": d["LOB"],
    "Existing Premium": d["Existing Premium"],
    "RM": d["RM"],
    "Insurance Company": d["Name of Insurance Company"],
    "Valid Upto": d["Valid Upto"],
    "Status": d["Lead Current Status"],
  }));
  const ws2 = XLSX.utils.json_to_sheet(renewalData);
  XLSX.utils.book_append_sheet(wb, ws2, 'Renewal Tracker');

  // Sheet 3: RM Portfolio
  const rmData = rawSampleData.map((d, i) => ({
    "Sl. No.": i + 1,
    "RM": d["RM"],
    "Client": d["Company Name"],
    "State": d["State"],
    "City": d["City"],
    "Turnover (Cr)": d["Turnover (Cr)"],
    "Premium": d["Existing Premium"],
    "Policy Type": d["Policy Type"],
  }));
  const ws3 = XLSX.utils.json_to_sheet(rmData);
  XLSX.utils.book_append_sheet(wb, ws3, 'RM Portfolio');

  return wb;
}
