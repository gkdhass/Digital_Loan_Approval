class Solution {
    public int[] relativeSortArray(int[] arr1, int[] arr2) {
        List<Integer> res = new ArrayList<>();
        int n1 = arr1.length;
        int n2 = arr2.length;

        for(int i=0; i<n2; i++){
            for(int j=0; j<n1; j++){
                if(arr1[j] == arr2[i]){
                    res.add(arr1[j]);
                }
            }
        }
        Arrays.sort(arr1);

        for(int i=0; i<n1; i++){
            boolean found = false;
            for(int j=0; j<n2; j++){
                if(arr1[i] == arr2[j]){
                    found = true;
                    break;
                }
            }
            if(!found){
                res.add(arr1[i]);
            }
        }
       
        int[] ans = new int[res.size()];
        for(int i =0; i<res.size(); i++){
            ans[i] = res.get(i);
        }
        return ans;
    }
}