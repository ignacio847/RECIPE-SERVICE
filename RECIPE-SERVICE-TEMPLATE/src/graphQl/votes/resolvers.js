const service = require("../../service/service");

const resolvers ={
    Query:{
        showVoteNotApproved: async () =>{
            try{
                const votes = await service.showVoteNotApproved();
                return votes.success ? {
                __typename:"listVote",
                success:votes.success,
                votes: votes.message
                }:
                {
                __typename:"voteErrorMessage",
                success:votes.success,
                message: votes.message || "algo salio mal."
                }
            }catch(error){
                return {
                __typename:"voteErrorMessage",
                success:votes.success,
                message: votes.error.message || "algo salio mal."
                };
            }
        },
        showVotes: async (_,{id},context) => {
            try{
                const {informationToken} = context;
                const response = await service.showVotes(id,informationToken.nickName);
                console.log(response)
                return response.success ? {
                __typename:"listVote",
                success:response.success,
                userHasVoted:response.userHasVoted,
                votes:response.votes
                }:{
                __typename:"voteErrorMessage",
                success:response.success,
                message:response.message
        
                };
            }catch(error){
                return {
                    __typename:"voteErrorMessage",
                    success:false,
                    message:error.message
                };
            }
        },
    },
    Mutation:{
        makeAVote: async (_,{id,stars,description}, context) => {
            try{
                if( stars <= 0 || stars > 5 )
                return {success:false, message:"las estrellas deben estar entre 1 y 5."};
        
                const {informationToken} = context;
                
                const vote = {
                recipeId:id,
                nickName:informationToken.nickName,
                stars:stars,
                description:description
                };
        
                const response = await service.makeAVote(vote);
        
                return response;
        
            }catch(error){
                return {success:false, message:error.message};
            }
        },     
        approveVotes: async (_,{id,accept}) =>{
            try{
                const response = service.approveVotes(id,accept);
                return response;
            }catch(error){
                return {success:false, message:error.message}
            }
        },
        updateVote: async (_,{id, stars, description}) => {
        try{
            const response = await service.updateVote(id, stars, description);
            return response;
        }catch(error){
            return {success:false, message:error.message};
        }
        }, 
        deleteVote: async (_,{id}) => {
        try{
            const response = await service.deleteVote(id);
            return response;
        }catch(error){
            return {success:false, message:error.message};
        }
        },
    },
    votesNotApprovedMessage:{
        __resolveType(obj){
            return obj.__typename;
        }
    },
    showVotesMessage:{
        __resolveType(obj){
            return obj.__typename;
        }
    }
};

module.exports = resolvers;