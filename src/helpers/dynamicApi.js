import { backendApi } from "src/configs/axios";

export const getDynamicApiToken = async () => {
    const response = await backendApi.get("/web/dynamic/get-token");
    return response.data;
};

export const fetchUom = async (token, dataAreaId = "suj", UnitSymbol = null, TranslatedDescription = null) => {
    try {
        const response = await backendApi.get("/web/dynamic/fetch-uom", {
            params: {
                token: token,
                dataAreaId: dataAreaId,
                UnitSymbol: UnitSymbol,
                TranslatedDescription: TranslatedDescription
            },
        });

        return response.data.data;
    } catch (error) {
        console.log("Failed to fetch UOM", error.message);
    }
};

export const fetchProductCategories = async (token, ParentProductCategoryCode = null) => {
    try {
        const response = await backendApi.get("/web/dynamic/product-categories", {
            params: {
                token: token,
                ParentProductCategoryCode: ParentProductCategoryCode,
            }
        });
        const data = response.data.data;
        const uniqueParentCodes = new Set();

        const uniqueData = data.filter((item) => {
            if (!uniqueParentCodes.has(item.ParentProductCategoryCode)) {
                uniqueParentCodes.add(item.ParentProductCategoryCode);

                return true;
            }

            return false;
        });

        return {
            raw: data,
            unique: uniqueData
        };
    } catch (error) {
        console.log("Failed to fetch types", error.message);
    }
};
