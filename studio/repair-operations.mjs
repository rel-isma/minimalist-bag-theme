export const FILES_BY_URL=`query StudioFilesByUrl($query:String!){files(first:10,query:$query){nodes{id fileStatus ... on MediaImage{image{url}mediaErrors{code message}}}}}`;
export const FILE_STATE=`query StudioFileState($id:ID!){node(id:$id){... on MediaImage{id fileStatus image{url}mediaErrors{code message}}}}`;
export const PRODUCT_MEDIA=`query StudioProductMedia($id:ID!){product(id:$id){media(first:100){nodes{id alt status ... on MediaImage{mediaErrors{code message}image{url}}}}}}`;
export const ASSOCIATE_FILES=`mutation StudioAssociateFiles($files:[FileUpdateInput!]!){fileUpdate(files:$files){files{id fileStatus}userErrors{field message}}}`;
// fileUpdate rejects FAILED files. This product-scoped operation removes only failed media.
export const REMOVE_FAILED_MEDIA=`mutation StudioRemoveFailedMedia($productId:ID!,$mediaIds:[ID!]!){productDeleteMedia(productId:$productId,mediaIds:$mediaIds){deletedMediaIds mediaUserErrors{field message}}}`;
