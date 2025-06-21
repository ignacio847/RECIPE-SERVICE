const service = require("../../service/service");

const resolvers = {
    Query:{
       
    },
    Mutation:{
        addInterests: async (_,{nickname,interests})=>{
            try{
                const time = interests.timeSpent;
                const ability = ["bajo", "medio", "alto"];
                const habilidadValida = ability.includes(interests.ability.toLowerCase());
                
                if (
                    time.initial >= time.end ||
                    time.initial < 1 ||
                    time.end > 45 ||
                    !habilidadValida
                ) {
                    return {
                        success: false,
                        message: "Valores de preferencias inválidos."
                    };
                }
                const newInterests = {
                    nickName:nickname,
                    ability:interests.ability,
                    diet:interests.diet,
                    intolerances:interests.intolerances,
                    timeSpent:{
                        initial:interests.timeSpent.initial,
                        end:interests.timeSpent.end
                    }
                }

                const response = await service.addInterests(nickname,newInterests);
                return response;
            }catch(error){
                return {success:false, message:error.message};
            }
        },
        updateInterests: async (_,{nickname,interests})=>{
            try{
                const time = interests.timeSpent;
                const ability = ["bajo", "medio", "alto"];
                const habilidadValida = ability.includes(interests.ability.toLowerCase());
                
                if (
                    time.initial >= time.end ||
                    time.initial < 1 ||
                    time.end > 45 ||
                    !habilidadValida
                ) {
                    return {
                        success: false,
                        message: "Valores de preferencias inválidos."
                    };
                }
                const response = service.updateInterests(nickname, interests);
                return response;
            }catch(error){
                return {success:false,message:error.message};
            }
        }
    }
};

module.exports = resolvers;