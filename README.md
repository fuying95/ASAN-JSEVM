# ASAN-JSEVM

The attracts during the transaction of Ethereum were dangerous. It may cause the loss of large amount of money. There were many kinds of tools could test the vulnerabilities in the smart contracts to protect the Ethereum, but there still many vulnerabilities had been missed form our test. So, we came out an idea to improve the Ethereum Virtual Machine (EVM). Although the smart contract includes vulnerabilities, the EVM could still stop the dangerous contract in time. 

Basically, our enhanced EVM, we called it EVM*, which include three steps: monitoring strategy definition, opcode-structure maintenance and EVM instrumentation.

  • Monitoring strategy definition provide some specific method to define if there any dangerous operation existed during the transaction execute. 

  • Opcode-structure maintenance means to maintain and analysis a structure to store the related opcodes before any transaction execute. When the code violates the rules defined in the monitoring strategy module, the opcode sequences will be defined to be dangerous, and the contract will be blocked.  

  • EVM instrumentation is to add monitoring strategies, interrupting mechanism, and opcode structure operations in the proper place of the EVM source code. Monitoring strategies should be instrumented in a new file in the EVM project folder. Each strategy needs to be wrapped into a function that returns a Boolean type. The interrupting mechanism could be wrapped into a function which is able to terminate the EVM. As for the operations of opcode-structure, the initialization process of the structure should be inserted in the place after where the CALL opcode is detected. Right before the execution of each operation, the opcode-structure should be tested using each monitoring strategy function.

Unlike other existed improved EVM, we don’t provide any detection tool to search the vulnerabilities in the contract or formalize the EVM for verification. Our EVM* could remedy to deal the missed vulnerabilities passing the detecting tools. The contract could be stopped when vulnerabilities occurs.

To evaluate the effect of our EVM*, we implement it on js-evm, which is a widely-used EVM platform written in javascript. We collected 10 smart contracts that include bugs, and make it execute on both original EVM and out EVM*. As the result, the original EVM didn’t block any of the contract, but EVM* blocked all of them successfully. 

For the time consumption, the different situation of monitoring strategies we added in EVM* had a great influence on the time consume for it to complete the contracts. For the time overhead, the EVM* with the overflow strategy is slower than the original EVM by 22.16%, the EVM* with the timestamp strategy is slower by 28.98% and the EVM* with both strategies is slower by 32.96%. However, it is still in the tolerable range for the financial critical applications. 

# ASAN-JSEVM简介

对以太坊交易的攻击可能是危险的，因为它们可能导致巨额资金损失。有许多工具可以检测智能合约中的漏洞，以避免潜在的攻击。但是，我们发现合同中仍有许多错过的漏洞。受此启发，我们提出了一种方法，可以强化EVM，即使智能合约包含漏洞，也能实时阻止危险交易。

基本上，该方法包括三个步骤：监控策略定义，操作码结构维护和EVM检测。

•	监控策略定义提供了一种特定的方法来确定在执行事务期间是否存在危险操作。

•	操作码结构维护是在执行任何操作之前维护一个结构来存储目标的操作码以进行分析。如果结构中的操作码序列被认为是危险的，即违反了监视策略模块中定义的任何约束，则将中断执行。 

•	EVM检测是在EVM源代码的适当位置插入监视策略，中断机制和操作码结构操作的过程。这些东西被安插在EVM项目文件夹中的新文件中。每个策略都需要包装到一个返回布尔类型的函数中。中断机制可以包装成能够终止EVM的功能。对于操作码结构的操作，初始化过程应该在检测到CALL操作码时安插在其之后。在执行每个操作之前，应使用每个监视策略函数测试操作码结构。通过这种方式，强化的EVM* 可以实时阻止危险的交易。

与其他改进的EVM不同，我们不提供检测工具来发现智能联系中的漏洞或将EVM正式化以进行验证。我们提出了一种强化EVM的方法。增强的EVM* 可以弥补检测工具。如果这些工具在事务中发生，则可以阻止这些漏洞遗漏的漏洞。

为了评估，我们在js-evm上实现了EVM* ，这是一个用javascript编写的通用的EVM平台。我们在网上收集了10份包含已知bug的合同并使用每份合同在原始的EVM和我们强化的EVM* 执行危险交易，原始EVM没有停止任何危险交易，而强化EVM* 上的所有交易都已中断。

对于时间开销，强化EVM* 的时间开销与我们添加到EVM中的监控策略的数量和合同规模有关。具有溢出策略的EVM* 比原始EVM慢22.16％，具有时间戳策略的EVM* 减慢28.98％并且具有两种策略的EVM* 减慢32.96％。但在金融关键应用程序的时间开销范围中是可以容忍的。
