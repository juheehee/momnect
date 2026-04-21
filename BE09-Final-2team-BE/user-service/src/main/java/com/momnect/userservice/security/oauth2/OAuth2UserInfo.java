package com.momnect.userservice.security.oauth2;

public interface OAuth2UserInfo {
    String getProviderId();
    String getProvider();
    String getEmail();
    String getNickname();
    String getProfileImageUrl();
}
