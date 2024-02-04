const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function checkProfile(req){
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('uid', req.oidc.user.sid).single();
    if(error) console.log(error);
    if(data) {
        const reset_time = await data.profile.gen_refresh ? data.profile.gen_refresh : 0;
        if(Date.now() > reset_time) {
            await setDB();
            console.log("Profile refreshed");
        }
    }
    else {
        await setDB();
        profile = await supabase.from('users').select('*').eq('uid', req.oidc.user.sid).limit(1).maybeSingle();
        console.log(profile)
        console.log("Profile created: " + profile);
    }
    return data;

}
async function setDB(req){
    // set database with profile in users column, with the "profile_obj" data
    const currentDate = new Date();
    var profile_obj = {
        user:req.oidc.user,
        premium: 0,
        premiumExpiry: null,
        gen_refresh:new Date(currentDate.getFullYear(),currentDate.getMonth(),currentDate.getDate() + 1,0,0,0).getTime(),
        free_gens:10
    }
    const { data, error } = await supabase
        .from('users')
        .upsert(
            [
                { "profile": profile_obj },
                { "uid": req.oidc.user.sid }
            ]
                )
        .eq('uid', req.oidc.user.sid).select();
        if(error) console.log(error);
    console.log("Profile updated: " + JSON.stringify(data));
    return;

 }
 module.exports = {checkProfile, setDB}