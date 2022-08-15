import React, { useState, useEffect } from 'react';
import mockUser from './mockData.js/mockUser';
import mockRepos from './mockData.js/mockRepos';
import mockFollowers from './mockData.js/mockFollowers';
import axios from 'axios';

const rootUrl = 'https://api.github.com';

const GithubContext = React.createContext();

const GithubProvider = ({children})=>{
    const [githubUser,setGithubUser] = useState(mockUser);
    const [repos,setGithubRepos] = useState(mockRepos);
    const [followers,setGithubFollowers] = useState(mockFollowers);
    // request 
    const [requests, setRequests] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    // error
    const [error,setError] = useState({show:false, msg:""});

    const searchGithubUser = async(user)=>{
        toggleError();
        setIsLoading(true);
        const response = await axios(`${rootUrl}/users/${user}`).catch(err=>console.log(err));
        // console.log(response);
        if(response){
            setGithubUser(response.data);
            const {login, followers_url} = response.data;

            Promise.allSettled([axios(`${rootUrl}/users/${login}/repos?per_page=100`), axios(`${followers_url}?per_page=100`)]).then((results)=>{
                const [repos,followers] = results;
                const status = 'fulfilled';
                if(repos.status === status){
                    setGithubRepos(repos.value.data);
                }

                if(followers.status === status){
                    setGithubFollowers(followers.value.data);
                }

            });
          
        }else{
            toggleError(true,'there is no user with that username');
        }
        setIsLoading(false);
    }

    // check rate limite

    const checkRequests = ()=>{
    axios(`${rootUrl}/rate_limit`).then(({data})=>{
      
        let {rate : {remaining}} = data;
        
        setRequests(remaining);
        if(remaining === 0){
            // throw an error
            toggleError(true,'Sorry , You have used your all hourly limit');
        }
    }).catch((err)=>{console.log(err)})
}

function toggleError(show = false, msg = ''){
    setError({show,msg});
}

    useEffect(checkRequests,[])
    return(
            <GithubContext.Provider value={{githubUser,repos,followers,requests,error,searchGithubUser,isLoading}}>
                {children}
            </GithubContext.Provider>

    );
}
export {GithubProvider,GithubContext}

