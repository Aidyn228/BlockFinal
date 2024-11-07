// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DecentralizedStoragePlatform {
    // Storage offering made by a provider
    struct StorageOffering {
        uint256 offeringId;
        address payable provider;
        uint256 capacity; // in GB
        uint256 pricePerGBPerDay; // in wei
        bool isAvailable;
    }

    // Agreement between a consumer and a provider
    struct StorageAgreement {
        uint256 agreementId;
        address payable consumer;
        address payable provider;
        uint256 capacity; // in GB
        uint256 pricePerGBPerDay; // in wei
        uint256 totalPrice; // in wei
        uint256 startTime; // timestamp
        uint256 endTime; // timestamp
        bool isActive;
    }

    uint256 public offeringCounter;
    uint256 public agreementCounter;

    mapping(uint256 => StorageOffering) public offerings;
    mapping(uint256 => StorageAgreement) public agreements;

    // Events
    event OfferingCreated(uint256 indexed offeringId, address indexed provider, uint256 capacity, uint256 pricePerGBPerDay);
    event OfferingUpdated(uint256 indexed offeringId, address indexed provider, uint256 capacity, uint256 pricePerGBPerDay);
    event OfferingRemoved(uint256 indexed offeringId, address indexed provider);
    event AgreementCreated(
        uint256 indexed agreementId,
        address indexed consumer,
        address indexed provider,
        uint256 capacity,
        uint256 totalPrice,
        uint256 startTime,
        uint256 endTime
    );
    event AgreementCancelled(uint256 indexed agreementId);

    // Providers create new offerings
    function createOffering(uint256 _capacity, uint256 _pricePerGBPerDay) external {
        require(_capacity > 0, "Capacity must be greater than zero");
        require(_pricePerGBPerDay > 0, "Price must be greater than zero");

        offeringCounter++;
        offerings[offeringCounter] = StorageOffering({
            offeringId: offeringCounter,
            provider: payable(msg.sender),
            capacity: _capacity,
            pricePerGBPerDay: _pricePerGBPerDay,
            isAvailable: true
        });

        emit OfferingCreated(offeringCounter, msg.sender, _capacity, _pricePerGBPerDay);
    }

    // Providers can update their offering
    function updateOffering(uint256 _offeringId, uint256 _capacity, uint256 _pricePerGBPerDay) external {
        StorageOffering storage offering = offerings[_offeringId];
        require(offering.provider == msg.sender, "Only provider can update their offering");
        require(offering.isAvailable, "Offering is not available");

        offering.capacity = _capacity;
        offering.pricePerGBPerDay = _pricePerGBPerDay;

        emit OfferingUpdated(_offeringId, msg.sender, _capacity, _pricePerGBPerDay);
    }

    // Providers can remove their offering
    function removeOffering(uint256 _offeringId) external {
        StorageOffering storage offering = offerings[_offeringId];
        require(offering.provider == msg.sender, "Only provider can remove their offering");
        require(offering.isAvailable, "Offering is already removed");

        offering.isAvailable = false;

        emit OfferingRemoved(_offeringId, msg.sender);
    }

    // Consumers accept an offering
    function acceptOffering(uint256 _offeringId, uint256 _capacity, uint256 _durationInDays, uint256 _startTime) external payable {
        StorageOffering storage offering = offerings[_offeringId];
        require(offering.isAvailable, "Offering not available");
        require(_capacity > 0 && _capacity <= offering.capacity, "Invalid capacity requested");
        require(_durationInDays > 0, "Duration must be greater than zero");
        require(_startTime >= block.timestamp, "Start time must be in the future");

        uint256 totalPrice = _capacity * offering.pricePerGBPerDay * _durationInDays;
        require(msg.value == totalPrice, "Incorrect payment amount");

        agreementCounter++;
        uint256 endTime = _startTime + (_durationInDays * 1 days);

        agreements[agreementCounter] = StorageAgreement({
            agreementId: agreementCounter,
            consumer: payable(msg.sender),
            provider: offering.provider,
            capacity: _capacity,
            pricePerGBPerDay: offering.pricePerGBPerDay,
            totalPrice: totalPrice,
            startTime: _startTime,
            endTime: endTime,
            isActive: true
        });

        // Reduce the available capacity of the offering
        offering.capacity -= _capacity;
        if (offering.capacity == 0) {
            offering.isAvailable = false;
        }

        emit AgreementCreated(
            agreementCounter,
            msg.sender,
            offering.provider,
            _capacity,
            totalPrice,
            _startTime,
            endTime
        );
    }

    // Consumers can cancel the agreement before it starts
    function cancelAgreement(uint256 _agreementId) external {
        StorageAgreement storage agreement = agreements[_agreementId];
        require(agreement.isActive, "Agreement is not active");
        require(msg.sender == agreement.consumer, "Only consumer can cancel the agreement");
        require(block.timestamp < agreement.startTime, "Agreement has already started");
        agreement.isActive = false;
        // Refund the consumer
        agreement.consumer.transfer(agreement.totalPrice);
        emit AgreementCancelled(_agreementId);
    }
    // Fallback and receive functions to handle plain Ether transfers
    fallback() external payable {
        revert("Invalid transaction");
    }
    receive() external payable {
        revert("Cannot accept Ether directly");
    }

    // Additional functions for providers to withdraw funds, etc., can be added as needed
}
