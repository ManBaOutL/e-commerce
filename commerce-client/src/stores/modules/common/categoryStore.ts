import request from "@/utils/request";
import { defineStore } from "pinia";
import { reqGetCategories } from "@/api/product";
import type { CategoryState } from "@/stores/types";

export const useCategoryStore = defineStore('categoryStore', {
    state: ():CategoryState => ({
        categoryTree: [],
    }),
    actions: {
        async getCategoryList() {
            const res = await reqGetCategories();
            this.categoryTree = res.data;
        },
    },
});