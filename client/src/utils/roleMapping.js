// Utility function to get role to department mapping, filtered by available categories
export const getRoleDepartmentMapping = (allCategories = []) => {
    const baseMapping = {
        "water network staff member": "Water Supply - Drinking Water",
        "sewer system staff member": "Sewer System", 
        "road maintenance staff member": "Roads and Urban Furnishings",
        "traffic management staff member": "Road Signs and Traffic Lights",
        "electrical staff member": "Public Lighting",
        "building maintenance staff member": "Architectural Barriers",
        "accessibility staff member": "Architectural Barriers",
        "recycling program staff member": "Waste",
        "parks maintenance staff member": "Public Green Areas and Playgrounds",
    };
    
    // Filter the mapping to only include categories that are available
    const filteredMapping = {};
    for (const role in baseMapping) {
        const category = baseMapping[role];
        if (allCategories.length === 0 || allCategories.includes(category)) {
            filteredMapping[role] = category;
        }
    }
    
    return filteredMapping;
};