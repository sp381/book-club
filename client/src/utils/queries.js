import { gql } from '@apollo/client';

//me query 

export const QUERY_USER = gql`
    query user($username: String) {
        thoughts(username: $username) {
            _id
            username
            email
            bookCount
            savedBooks

        }
    }
`;

export const QUERY_BOOK = gql`
    query book($id: ID!) {
        book(_id: $id) {
            _id
            authors
            description
            title 
            image
            link
        }
    }
`;
