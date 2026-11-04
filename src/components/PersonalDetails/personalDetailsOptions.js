// Dropdown options for the personal-details stage. The design names no list,
// so this covers India (the Kochi office) and the GCC countries with their
// states / regions. Replace with backend data when it exists.
export const countryStates = {
    India: [
        "Andaman and Nicobar Islands",
        "Andhra Pradesh",
        "Arunachal Pradesh",
        "Assam",
        "Bihar",
        "Chandigarh",
        "Chhattisgarh",
        "Dadra and Nagar Haveli and Daman and Diu",
        "Delhi",
        "Goa",
        "Gujarat",
        "Haryana",
        "Himachal Pradesh",
        "Jammu and Kashmir",
        "Jharkhand",
        "Karnataka",
        "Kerala",
        "Ladakh",
        "Lakshadweep",
        "Madhya Pradesh",
        "Maharashtra",
        "Manipur",
        "Meghalaya",
        "Mizoram",
        "Nagaland",
        "Odisha",
        "Puducherry",
        "Punjab",
        "Rajasthan",
        "Sikkim",
        "Tamil Nadu",
        "Telangana",
        "Tripura",
        "Uttar Pradesh",
        "Uttarakhand",
        "West Bengal",
    ],
    "Saudi Arabia": [
        "Al Bahah",
        "Al Jawf",
        "Al Madinah",
        "Al Qassim",
        "Asir",
        "Eastern Province",
        "Ha'il",
        "Jazan",
        "Makkah",
        "Najran",
        "Northern Borders",
        "Riyadh",
        "Tabuk",
    ],
    "United Arab Emirates": ["Abu Dhabi", "Ajman", "Dubai", "Fujairah", "Ras Al Khaimah", "Sharjah", "Umm Al Quwain"],
    Qatar: ["Al Daayen", "Al Khor", "Al Rayyan", "Al Shamal", "Al Shahaniya", "Al Wakrah", "Doha", "Umm Salal"],
    Kuwait: ["Al Ahmadi", "Al Asimah", "Al Farwaniyah", "Al Jahra", "Hawalli", "Mubarak Al-Kabeer"],
    Oman: [
        "Ad Dakhiliyah",
        "Ad Dhahirah",
        "Al Batinah North",
        "Al Batinah South",
        "Al Buraimi",
        "Al Wusta",
        "Ash Sharqiyah North",
        "Ash Sharqiyah South",
        "Dhofar",
        "Musandam",
        "Muscat",
    ],
    Bahrain: ["Capital", "Muharraq", "Northern", "Southern"],
};

export const countries = Object.keys(countryStates);

export const genders = ["Male", "Female", "Prefer Not to Say"];

// Language picker suggestions and fluency levels (Figma 1878:19740 names no
// lists).
export const languages = [
    "English",
    "Arabic",
    "Hindi",
    "Malayalam",
    "Tamil",
    "Kannada",
    "Telugu",
    "Urdu",
    "Bengali",
    "Marathi",
    "French",
    "German",
    "Spanish",
];
// Picking this lets the candidate type a language that isn't listed.
export const OTHER_OPTION = "Other";
export const fluencyLevels = ["Native", "Fluent", "Conversational", "Basic"];

// Phone country codes for the same countries, with the length of a local
// (national) number there, used by the phone check.
export const phoneCodes = [
    { country: "India", code: "+91", digits: [10] },
    { country: "Saudi Arabia", code: "+966", digits: [9] },
    { country: "United Arab Emirates", code: "+971", digits: [9] },
    { country: "Qatar", code: "+974", digits: [8] },
    { country: "Kuwait", code: "+965", digits: [8] },
    { country: "Oman", code: "+968", digits: [8] },
    { country: "Bahrain", code: "+973", digits: [8] },
];

export const DEFAULT_PHONE_CODE = "+91";
